import type { JaculusProjectType } from '@jaculus/project';

export interface IDbProject {
  id: string;
  name: string;
  type: JaculusProjectType;
  createdAt: number;
  modifiedAt: number;
  deletedAt: number | null;
}
