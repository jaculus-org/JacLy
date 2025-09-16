export type JacProjectType = 'jacly' | 'code';

export type ConnectionType = 'web-serial' | 'web-bluetooth' | 'wokwi';

export type JacProjectConfig = {
  name: string;
  uuid: string;
  created: Date;
  lastModified: Date;
  jaculusVersion: string;
  projectType: JacProjectType;
  connectionType?: ConnectionType;
};
