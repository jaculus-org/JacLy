import type { JaculusProjectType } from '@jaculus/project';

export interface IProject {
  id: string;
  name: string;
  type: JaculusProjectType;
  createdAt: number;
  modifiedAt: number;
  deletedAt: number | null;
}
