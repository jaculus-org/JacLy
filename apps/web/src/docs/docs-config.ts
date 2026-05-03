export interface DocPage {
  slug: string;
  title: string;
}

export const DOC_PAGES: DocPage[] = [
  { slug: 'index', title: 'Documentation' },
  { slug: 'faq', title: 'FAQ' },
];

export const allDocModules = import.meta.glob('/docs/*.md');
export const csDocModules = import.meta.glob('/docs/*.cs.md');

export const enDocModules = Object.fromEntries(
  Object.entries(allDocModules).filter(([k]) => !/\.[a-z]{2}\.md$/.test(k)),
);
