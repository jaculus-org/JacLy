import { cn } from '@/lib/utils/cn';
import { ChevronDown, ChevronRight, FolderOpen, Folder } from 'lucide-react';
import { memo } from 'react';
import { getFileIcon } from './helper';
import type { FileTreeNodeProps } from './types';

import {
  ContextMenu,
  ContextMenuTrigger,
} from '@/features/shared/components/ui/context-menu';

export const FileTreeNode = memo(
  ({
    item,
    depth,
    expandedFolders,
    selectedItem,
    onToggle,
    onOpen,
    onSelect,
    ContextMenuComponent,
  }: FileTreeNodeProps) => {
    const isExpanded = expandedFolders.has(item.path);
    const isSelected = selectedItem === item.path;

    return (
      <div key={item.path}>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              className={cn(
                'flex items-center gap-1 px-2 py-1 text-sm cursor-pointer rounded transition-colors select-none',
                isSelected
                  ? 'bg-slate-200 dark:bg-slate-700'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
              style={{ paddingLeft: `${depth * 20 + 8}px` }}
              onClick={() => {
                onSelect(item.path);
                onOpen(item);
              }}
              onDoubleClick={e => {
                e.stopPropagation();
                onToggle(item);
              }}
            >
              {/* Expand/Collapse Chevron */}
              <div
                className={cn(
                  'flex items-center justify-center w-4 h-4 shrink-0',
                  item.isDirectory
                    ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 rounded'
                    : 'invisible'
                )}
                onClick={e => {
                  e.stopPropagation();
                  onToggle(item);
                }}
              >
                {item.isDirectory &&
                  (isExpanded ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  ))}
              </div>

              {/* Icon */}
              {item.isDirectory ? (
                isExpanded ? (
                  <FolderOpen size={16} className="text-blue-500 shrink-0" />
                ) : (
                  <Folder size={16} className="text-blue-500 shrink-0" />
                )
              ) : (
                <span className="shrink-0">
                  {getFileIcon(item.name, false)}
                </span>
              )}

              {/* Filename */}
              <span className="truncate flex-1 ml-1">{item.name}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuComponent item={item} />
        </ContextMenu>

        {/* Recursive Render */}
        {item.isDirectory && isExpanded && item.children && (
          <div>
            {item.children.map(child => (
              <FileTreeNode
                key={child.path}
                item={child}
                depth={depth + 1}
                expandedFolders={expandedFolders}
                selectedItem={selectedItem}
                onToggle={onToggle}
                onOpen={onOpen}
                onSelect={onSelect}
                ContextMenuComponent={ContextMenuComponent}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

FileTreeNode.displayName = 'FileTreeNode';
