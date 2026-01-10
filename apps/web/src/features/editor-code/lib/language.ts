export function inferLanguageFromPath(path: string): string {
  if (!path) return 'plaintext';
  const extension = path.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
    case 'jacly':
      return 'javascript';
    case 'json':
      return 'json';
    default:
      return 'plaintext';
  }
}
