import * as Blockly from 'blockly/core';
import {
  Backpack,
  type BackpackOptions,
} from '@blockly/workspace-backpack/dist/index.js';

const BACKPACK_STORAGE_KEY = 'jacly:blockly-backpack:v1';

interface BackpackSnapshot {
  updatedAt: number;
  contents: string[];
}

interface AttachedBackpack {
  backpack: Backpack;
  listener: (event: Blockly.Events.Abstract) => void;
}

const attachedBackpacks = new Map<Blockly.WorkspaceSvg, AttachedBackpack>();

let currentSnapshot: BackpackSnapshot = {
  updatedAt: 0,
  contents: [],
};
let syncingSharedContents = false;
let storageListenerRegistered = false;

const backpackOptions: BackpackOptions = {
  useFilledBackpackImage: true,
  skipSerializerRegistration: true,
  contextMenu: {
    copyAllToBackpack: true,
    pasteAllToBackpack: true,
  },
};

export function attachWorkspaceBackpack(workspace: Blockly.WorkspaceSvg) {
  if (attachedBackpacks.has(workspace)) {
    return;
  }

  syncSnapshotFromStorage();

  const backpack = new Backpack(workspace, backpackOptions);
  backpack.init();
  backpack.setContents(getVisibleContents(currentSnapshot));
  ensureStorageListener();

  const listener = (event: Blockly.Events.Abstract) => {
    if (syncingSharedContents || event.type !== 'backpack_change') {
      return;
    }

    syncSnapshotFromStorage();
    const nextSnapshot = createSnapshot(
      mergeVisibleContentsIntoSnapshot(backpack.getContents())
    );
    currentSnapshot = nextSnapshot;
    persistSnapshot(nextSnapshot);
    syncBackpacks(nextSnapshot, workspace);
  };

  workspace.addChangeListener(listener);
  attachedBackpacks.set(workspace, { backpack, listener });
}

export function disposeWorkspaceBackpack(workspace: Blockly.WorkspaceSvg) {
  const attached = attachedBackpacks.get(workspace);
  if (!attached) {
    return;
  }

  workspace.removeChangeListener(attached.listener);
  attached.backpack.dispose();
  attachedBackpacks.delete(workspace);

  if (attachedBackpacks.size === 0) {
    removeStorageListener();
  }
}

function syncSnapshotFromStorage() {
  const storedSnapshot = readSnapshotFromStorage();
  if (!storedSnapshot) {
    return;
  }

  if (compareSnapshots(storedSnapshot, currentSnapshot) > 0) {
    currentSnapshot = storedSnapshot;
  }
}

function syncBackpacks(
  snapshot: BackpackSnapshot,
  sourceWorkspace?: Blockly.WorkspaceSvg
) {
  syncingSharedContents = true;

  try {
    for (const [workspace, attached] of attachedBackpacks) {
      if (sourceWorkspace && workspace === sourceWorkspace) {
        continue;
      }

      attached.backpack.setContents(getVisibleContents(snapshot));
    }
  } finally {
    syncingSharedContents = false;
  }
}

function ensureStorageListener() {
  if (storageListenerRegistered || typeof window === 'undefined') {
    return;
  }

  window.addEventListener('storage', handleStorageChange);
  storageListenerRegistered = true;
}

function removeStorageListener() {
  if (!storageListenerRegistered || typeof window === 'undefined') {
    return;
  }

  window.removeEventListener('storage', handleStorageChange);
  storageListenerRegistered = false;
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== BACKPACK_STORAGE_KEY || !event.newValue) {
    return;
  }

  const nextSnapshot = parseSnapshot(event.newValue);
  if (!nextSnapshot) {
    return;
  }

  if (compareSnapshots(nextSnapshot, currentSnapshot) <= 0) {
    return;
  }

  currentSnapshot = nextSnapshot;
  syncBackpacks(nextSnapshot);
}

function createSnapshot(contents: string[]): BackpackSnapshot {
  return {
    updatedAt: Date.now(),
    contents: [...contents],
  };
}

function persistSnapshot(snapshot: BackpackSnapshot) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(BACKPACK_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage failures so the editor stays usable.
  }
}

function readSnapshotFromStorage(): BackpackSnapshot | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return parseSnapshot(window.localStorage.getItem(BACKPACK_STORAGE_KEY));
  } catch {
    return null;
  }
}

function parseSnapshot(rawValue: string | null): BackpackSnapshot | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.updatedAt !== 'number' ||
      !Array.isArray(parsed.contents) ||
      parsed.contents.some((item: unknown) => typeof item !== 'string')
    ) {
      return null;
    }

    return {
      updatedAt: parsed.updatedAt,
      contents: [...parsed.contents],
    };
  } catch {
    return null;
  }
}

function compareSnapshots(
  left: BackpackSnapshot,
  right: BackpackSnapshot
): number {
  return left.updatedAt - right.updatedAt;
}

function getVisibleContents(snapshot: BackpackSnapshot) {
  return snapshot.contents.filter(content =>
    isContentValidForWorkspace(content)
  );
}

function mergeVisibleContentsIntoSnapshot(visibleContents: string[]) {
  const hiddenContents = currentSnapshot.contents.filter(
    content => !isContentValidForWorkspace(content)
  );

  return dedupeContents([...visibleContents, ...hiddenContents]);
}

function dedupeContents(contents: string[]) {
  return [...new Set(contents)];
}

function isContentValidForWorkspace(content: string): boolean {
  let parsedContent: Blockly.serialization.blocks.State;

  try {
    parsedContent = JSON.parse(content) as Blockly.serialization.blocks.State;
  } catch {
    return false;
  }

  return areBlockTypesRegistered(parsedContent);
}

function areBlockTypesRegistered(
  state: Blockly.serialization.blocks.State | undefined
): boolean {
  if (!state) {
    return true;
  }

  if (!Blockly.Blocks[state.type]) {
    return false;
  }

  if (state.inputs) {
    for (const input of Object.values(state.inputs)) {
      if (!areBlockTypesRegistered(input.block)) {
        return false;
      }

      if (!areBlockTypesRegistered(input.shadow)) {
        return false;
      }
    }
  }

  return (
    areBlockTypesRegistered(state.next?.block) &&
    areBlockTypesRegistered(state.next?.shadow)
  );
}
