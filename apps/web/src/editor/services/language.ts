export function inferLanguageFromPath(path: string): string {
  if (!path) return 'plaintext';
  const extension = path.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'ts':
      return 'typescript';
    case 'js':
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
