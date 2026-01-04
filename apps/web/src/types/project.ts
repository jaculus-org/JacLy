export type ProjectType = 'graphical' | 'code';

export interface IProject {
  id: string;
  name: string;
  type: ProjectType;
  createdAt: number;
  modifiedAt: number;
  deletedAt: number | null;
}
