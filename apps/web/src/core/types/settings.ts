import * as FlexLayout from 'flexlayout-react';

export interface ISettings {
  id: number;
  flexLayoutModel: FlexLayout.IJsonModel | null;
}

export const defaultSettings: ISettings = {
  id: 0,
  flexLayoutModel: null,
};
