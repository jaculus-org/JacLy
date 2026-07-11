import { JaclyEngine } from '@jaculus/jacly/engine';
import 'blockly/blocks';
import type { BrowserRenderPayload, SvgRenderResult } from '@shared/types';
import * as Blockly from 'blockly/core';
import * as Cs from 'blockly/msg/cs';
import * as En from 'blockly/msg/en';

const blockStyles = {
  basic_category: {
    colourPrimary: '#2196F3',
    colourSecondary: '#1E88E5',
    colourTertiary: '#1976D2',
  },
  adc_category: {
    colourPrimary: '#4CAF50',
    colourSecondary: '#43A047',
    colourTertiary: '#388E3C',
  },
  gpio_category: {
    colourPrimary: '#FF9800',
    colourSecondary: '#FB8C00',
    colourTertiary: '#F57C00',
  },
  i2c_category: {
    colourPrimary: '#9C27B0',
    colourSecondary: '#8E24AA',
    colourTertiary: '#7B1FA2',
  },
};

function makeTheme(theme: 'light' | 'dark'): Blockly.Theme {
  return Blockly.Theme.defineTheme(`jacly-render-${theme}`, {
    name: `jacly-render-${theme}`,
    base: Blockly.Themes.Zelos,
    blockStyles,
    componentStyles:
      theme === 'dark'
        ? {
            workspaceBackgroundColour: '#1e1e1e',
            toolboxBackgroundColour: '#252526',
            toolboxForegroundColour: '#cccccc',
          }
        : undefined,
  });
}

function collectCss(): string {
  const rules: string[] = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) rules.push(rule.cssText);
    } catch {
      // Cross-origin stylesheets cannot be read. The renderer bundle currently has none.
    }
  }
  return rules.join('\n');
}

function getMessageMap(module: unknown): Record<string, string> {
  let candidate = module;
  for (let depth = 0; depth < 3; depth += 1) {
    const record = candidate as Record<string, unknown>;
    if (typeof record.ADD_COMMENT === 'string') return record as Record<string, string>;
    candidate = record.default;
  }
  throw new Error('Blockly locale module does not contain a valid message map');
}

async function renderWorkspace(payload: BrowserRenderPayload): Promise<SvgRenderResult> {
  Blockly.setLocale(getMessageMap(payload.options.locale === 'cs' ? Cs : En));

  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.inset = '0';
  host.style.width = '4096px';
  host.style.height = '4096px';
  document.body.replaceChildren(host);

  const engine = new JaclyEngine();
  engine.buildToolbox(payload.blockData as never);
  const workspace = Blockly.inject(host, {
    readOnly: true,
    renderer: 'zelos',
    theme: makeTheme(payload.options.theme),
    scrollbars: false,
    sounds: false,
    trashcan: false,
    zoom: {
      controls: false,
      wheel: false,
      startScale: 1,
      minScale: 1,
      maxScale: 1,
    },
  });

  try {
    engine.attachToWorkspace(workspace);
    Blockly.serialization.workspaces.load(payload.workspace, workspace);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    if (workspace.getAllBlocks(false).length === 0) {
      throw new Error('Workspace contains no renderable blocks');
    }

    const canvas = workspace.getCanvas();
    const bounds = canvas.getBBox();
    if (bounds.width <= 0 || bounds.height <= 0) {
      throw new Error('Rendered workspace has empty bounds');
    }

    const padding = payload.options.padding;
    const viewBoxWidth = bounds.width + 2 * padding;
    const viewBoxHeight = bounds.height + 2 * padding;
    const width = Math.ceil(viewBoxWidth * payload.options.scale);
    const height = Math.ceil(viewBoxHeight * payload.options.scale);
    if (width > 10_000 || height > 10_000) {
      throw new Error(`Rendered image is too large (${width}x${height})`);
    }

    const svg = document.createElementNS(Blockly.utils.dom.SVG_NS, 'svg');
    svg.setAttribute('xmlns', Blockly.utils.dom.SVG_NS);
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svg.setAttribute(
      'class',
      `blocklySvg zelos-renderer jacly-render-${payload.options.theme}-theme`,
    );
    svg.setAttribute('style', 'background: transparent');
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.setAttribute(
      'viewBox',
      `${bounds.x - padding} ${bounds.y - padding} ${viewBoxWidth} ${viewBoxHeight}`,
    );
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'JacLy program');

    const style = document.createElementNS(Blockly.utils.dom.SVG_NS, 'style');
    style.textContent = collectCss();
    svg.append(style);

    const clonedCanvas = canvas.cloneNode(true) as SVGGElement;
    clonedCanvas.removeAttribute('transform');
    svg.append(clonedCanvas);

    return {
      svg: new XMLSerializer().serializeToString(svg),
      width,
      height,
    };
  } finally {
    engine.detachFromWorkspace(workspace);
    workspace.dispose();
  }
}

window.jaclyRenderer = { render: renderWorkspace };
