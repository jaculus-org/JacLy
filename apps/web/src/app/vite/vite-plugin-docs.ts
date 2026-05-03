import path from 'node:path';
import { marked } from 'marked';
import type { Plugin, ResolvedConfig } from 'vite';

function slugify(text: string): string {
  return text
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function addHeadingIds(html: string): string {
  return html.replace(/<(h[1-6])>(.*?)<\/h[1-6]>/gs, (_, tag, content) => {
    const id = slugify(content);
    return `<${tag} id="${id}">${content}</${tag}>`;
  });
}

export function docsPlugin(): Plugin {
  let projectRoot: string;

  return {
    name: 'jacly-docs',
    enforce: 'pre',
    configResolved(config: ResolvedConfig) {
      projectRoot = config.root;
    },
    transform(code: string, id: string) {
      if (!id.endsWith('.md')) return null;
      const docsDir = path.join(projectRoot, 'docs');
      if (!id.startsWith(docsDir)) return null;

      const html = addHeadingIds(marked(code) as string);
      return {
        code: `export const html = ${JSON.stringify(html)}; export const raw = ${JSON.stringify(code)};`,
        map: null,
      };
    },
  };
}
