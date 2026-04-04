export function inferLanguageFromPath(path: string): string {
  if (!path) return 'plaintext';
  const extension = path.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'jacly':
    case 'json':
      return 'json';
    case undefined:
      return 'plaintext';
    default:
      return 'plaintext';
  }
}
