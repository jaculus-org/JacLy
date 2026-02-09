import type { JaculusProjectType } from '@jaculus/project';
import * as FlexLayout from 'flexlayout-react';

export interface IDbProject {
  id: string;
  name: string;
  type: JaculusProjectType;
  createdAt: number;
  modifiedAt: number;
  deletedAt: number | null;
  layout?: FlexLayout.IJsonModel;
}
