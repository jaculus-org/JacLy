import { JaclyConfigSchema } from '../config';
import { FSInterface, FSPromisesInterface } from '@jaculus/project/fs';
import * as Blockly from 'blockly/core';
import { z } from 'zod';
import { metaBlocks } from './meta-blocks/index.js';
import { registerBlocklyJs } from './generator';

type ToolboxItemInfo = Blockly.utils.toolbox.ToolboxItemInfo;
type ToolboxInfo = Blockly.utils.toolbox.ToolboxInfo;

const GENERATED_CODE_PATH = 'build/index.js';
const JACLY_PROJECT_PATH = 'src/index.jacly';
const emptyToolbox: ToolboxInfo = {
  kind: 'categoryToolbox',
  contents: [],
};

export class JaclyBlocks {
  private fsp: FSPromisesInterface;

  constructor(
    private urlPrefix: string,
    private fs: FSInterface,
    private jacLyFilesPromise: Promise<string[]>
  ) {
    this.fsp = fs.promises;

    // if not exist build or src folder, create it
    if (!this.fs.existsSync(this.urlPrefix + '/build')) {
      this.fs.mkdirSync(this.urlPrefix + '/build', { recursive: true });
    }
    if (!this.fs.existsSync(this.urlPrefix + '/src')) {
      this.fs.mkdirSync(this.urlPrefix + '/src', { recursive: true });
    }
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

  async loadLibs(): Promise<ToolboxInfo> {
    let toolbox: ToolboxInfo = emptyToolbox;
    toolbox.contents = await this.loadMetaLibs();
    const fileLibs = await this.loadFileLibs(await this.jacLyFilesPromise);
    toolbox.contents = toolbox.contents.concat(fileLibs);
    return toolbox;
  }

  async loadMetaLibs(): Promise<ToolboxItemInfo[]> {
    let items: ToolboxItemInfo[] = [];

    // Load meta-blocks from imported modules (works in both web and Node.js)
    try {
      for (const [fileName, fileContent] of Object.entries(metaBlocks)) {
        const libItems = await this.loadMetaLib(fileName, fileContent);
        items.push(libItems);
      }
    } catch (error) {
      console.error(`Error loading meta libraries: ${error}`);
    }

    return items;
  }

  async loadMetaLib(
    fileName: string,
    fileContent: object
  ): Promise<ToolboxItemInfo> {
    const result = JaclyConfigSchema.safeParse(fileContent);
    if (result.success) {
      const libJson = result.data;

      if (libJson.contents !== undefined) {
        for (const block of libJson.contents) {
          if (block.message0 !== undefined) {
            await registerBlocklyJs(
              block,
              libJson.color,
              libJson.categorystyle
            );
          }
        }

        let toolboxInfo: ToolboxItemInfo = {
          kind: 'category',
          name: libJson.name,
          contents: libJson.contents,
          // Set category color so the UI can show proper colors in the toolbox
          colour: libJson.color,
        };

        return toolboxInfo;
      } else if (libJson.custom !== undefined) {
        let toolboxInfo: ToolboxItemInfo = {
          kind: 'category',
          name: libJson.name,
          custom: libJson.custom,
        };
        return toolboxInfo;
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
    throw new Error(`Invalid Jacly config in file ${fileName}`);
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
    if (!this.fs.existsSync(libFile)) {
      throw new Error(`Library file not found: ${libFile}`);
    }

    try {
      debugger;
      const fileContent = this.fs.readFileSync(libFile, 'utf-8');
      const result = JaclyConfigSchema.safeParse(JSON.parse(fileContent));
      if (result.success) {
        const libJson = result.data;

        if (libJson.contents !== undefined) {
          // Register blocks
          for (const block of libJson.contents) {
            if (block.message0 !== undefined) {
              await registerBlocklyJs(
                block,
                libJson.color,
                libJson.categorystyle
              );
            }
          }

          let toolboxInfo: ToolboxItemInfo = {
            kind: 'category',
            name: libJson.name,
            contents: libJson.contents,
            // Set category color so the UI can show proper colors in the toolbox
            colour: libJson.color,
          };
          return toolboxInfo;
        } else if (libJson.custom !== undefined) {
          let toolboxInfo: ToolboxItemInfo = {
            kind: 'category',
            name: libJson.name,
            custom: libJson.custom,
          };
          return toolboxInfo;
        } else {
          throw new Error(
            `Jacly config in file ${libFile} must have either 'contents' or 'custom' property.`
          );
        }
      } else {
        console.error(
          `Invalid Jacly config in file ${libFile}:`,
          z.prettifyError(result.error)
        );
        throw new Error(`Invalid Jacly config in file ${libFile}`);
      }
    } catch (error) {
      console.error(`Error loading library file ${libFile}: ${error}`);
      throw error;
    }
  }
}
