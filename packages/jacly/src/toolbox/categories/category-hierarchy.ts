import type { ToolboxItemInfoSort } from '@/toolbox/types';

// builds category tree from a flat list. top-level sorted by priority (undefined = last),
// subcategories sorted alphabetically inside their parent.
// parentCategory not found -> orphan -> goes into a synthetic "Other" at the end.
export function buildCategoryHierarchy(items: ToolboxItemInfoSort[]): ToolboxItemInfoSort[] {
  const topLevelCategories: ToolboxItemInfoSort[] = [];
  const subcategoriesMap = new Map<string, ToolboxItemInfoSort[]>();

  for (const item of items) {
    if (item.kind === 'category' && item.parentCategory) {
      const parentId = item.parentCategory;
      const list = subcategoriesMap.get(parentId);
      if (list) {
        list.push(item);
      } else {
        subcategoriesMap.set(parentId, [item]);
      }
    } else {
      topLevelCategories.push(item);
    }
  }

  topLevelCategories.sort((a, b) => {
    const priorityA = a.priority ?? Number.MAX_SAFE_INTEGER;
    const priorityB = b.priority ?? Number.MAX_SAFE_INTEGER;
    return priorityA - priorityB;
  });

  const orphans: ToolboxItemInfoSort[] = [];

  for (const category of topLevelCategories) {
    if (category.kind === 'category' && category.category) {
      const subs = subcategoriesMap.get(category.category);
      if (subs) {
        subs.sort((a, b) => {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
        });
        category.contents = [...(category.contents || []), ...subs];
        subcategoriesMap.delete(category.category);
      }
    }
  }

  for (const subs of subcategoriesMap.values()) {
    orphans.push(...subs);
  }

  if (orphans.length > 0) {
    orphans.sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
    topLevelCategories.push({
      kind: 'category',
      name: 'Other',
      category: '_fallback',
      colour: '#999999',
      contents: orphans,
      priority: Number.MAX_SAFE_INTEGER,
    });
  }

  return topLevelCategories;
}
