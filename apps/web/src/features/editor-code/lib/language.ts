export function inferLanguageFromPath(path: string): string {
  if (!path) return 'plaintext';
  const extension = path.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'ts':
      return 'typescript';
    case 'js':
    case 'jacly':
      return 'javascript';
    case 'json':
      return 'json';
    case 'txt':
    case undefined:
      return 'plaintext';
    default:
      return 'plaintext';
  }
}
