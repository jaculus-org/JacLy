import { JaclyConfigSchema } from '../config';
import { FSInterface, FSPromisesInterface } from '@jaculus/project/fs';
import * as Blockly from 'blockly/core';
import { z } from 'zod';
import { metaBlocks } from './meta-blocks/index.js';

type ToolboxItemInfo = Blockly.utils.toolbox.ToolboxItemInfo;
type ToolboxInfo = Blockly.utils.toolbox.ToolboxInfo;

const GENERATED_CODE_PATH = 'build/index.js';
const JACLY_PROJECT_PATH = 'src/project.jacly';
const emptyToolbox: ToolboxInfo = {
  kind: 'categoryToolbox',
  contents: [],
};

export class JaclyBlocks {
  private fsp: FSPromisesInterface;

  constructor(
    private urlPrefix: string,
    private fs: FSInterface
  ) {
    this.fsp = fs.promises;
  }

  private getFilePath(fileName: string): string {
    return `${this.urlPrefix}/${fileName}`;
  }

  async saveGeneratedCode(code: string) {
    return this.fsp.writeFile(this.getFilePath(GENERATED_CODE_PATH), code);
  }

  async saveJaclyProject(json: object) {
    return this.fsp.writeFile(
      this.getFilePath(JACLY_PROJECT_PATH),
      JSON.stringify(json)
    );
  }

  loadJaclyProject(): object {
    const file = this.getFilePath(JACLY_PROJECT_PATH);
    try {
      return JSON.parse(this.fs.readFileSync(file, 'utf-8'));
    } catch (error) {
      return {};
    }
  }

  async loadLibs(jaclyFiles: string[]): Promise<ToolboxInfo> {
    let toolbox: ToolboxInfo = emptyToolbox;
    toolbox.contents = await this.loadMetaLibs();
    const fileLibs = await this.loadFileLibs(jaclyFiles);
    toolbox.contents = toolbox.contents.concat(fileLibs);
    return toolbox;
  }

  async loadMetaLibs(): Promise<ToolboxItemInfo[]> {
    let items: ToolboxItemInfo[] = [];

    // Load meta-blocks from imported modules (works in both web and Node.js)
    try {
      for (const [fileName, fileContent] of Object.entries(metaBlocks)) {
        const result = JaclyConfigSchema.safeParse(fileContent);
        if (result.success) {
          const libJson = result.data;

          if (libJson.contents !== undefined) {
            let toolboxInfo: ToolboxItemInfo = {
              kind: 'category',
              name: libJson.name,
              contents: libJson.contents,
            };
            items.push(toolboxInfo);
          } else if (libJson.custom !== undefined) {
            let toolboxInfo: ToolboxItemInfo = {
              kind: 'category',
              name: libJson.name,
              custom: libJson.custom,
            };
            items.push(toolboxInfo);
          } else {
            throw new Error(
              `Jacly config in file ${fileName} must have either 'contents' or 'custom' property.`
            );
          }
        } else {
          console.error(
            `Invalid Jacly config in file ${fileName}:`,
            z.prettifyError(result.error)
          );
        }
      }
    } catch (error) {
      console.error(`Error loading meta libraries: ${error}`);
    }

    return items;
  }

  async loadFileLibs(jaclyFiles: string[]): Promise<ToolboxItemInfo[]> {
    let items: ToolboxItemInfo[] = [];
    for (const libFile of jaclyFiles) {
      const libItems = await this.loadFileLib(libFile);
      items = items.concat(libItems);
    }
    return items;
  }

  async loadFileLib(libFile: string): Promise<ToolboxItemInfo> {
    const filePath = this.getFilePath(libFile);
    if (!this.fs.existsSync(filePath)) {
      throw new Error(`Library file not found: ${filePath}`);
    }

    try {
      const fileContent = this.fs.readFileSync(filePath, 'utf-8');
      const libJson = JSON.parse(fileContent);
      return libJson;
    } catch (error) {
      throw new Error(
        `Error reading or parsing library file ${filePath}: ${error}`
      );
    }
  }
}
