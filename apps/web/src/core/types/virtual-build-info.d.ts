declare module 'virtual-build-info' {
  export interface BuildInfo {
    version: string;
    buildTime: string;
    commitHash: string;
    commitLink: string;
    repository: string;
  }

  export const buildInfo: BuildInfo;
}
