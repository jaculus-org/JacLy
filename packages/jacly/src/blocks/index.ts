import { JaclyConfigSchema } from '../config';
import { FSInterface, FSPromisesInterface } from '@jaculus/project/fs';
import * as Blockly from 'blockly/core';
import { z } from 'zod';
import { registerBlocklyJs } from './generator';

type ToolboxItemInfo = Blockly.utils.toolbox.ToolboxItemInfo;
type ToolboxInfo = Blockly.utils.toolbox.ToolboxInfo;

const GENERATED_CODE_PATH = 'build/index.js';
const JACLY_PROJECT_PATH = 'src/index.jacly';

export class JaclyBlocks {
  private fsp: FSPromisesInterface;
  // Add a map to track library types to their imports
  private libToImports: Map<string, string[]> = new Map();

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
    const path = this.getFilePath(GENERATED_CODE_PATH);
    if (!this.fs.existsSync(path)) {
      await this.fsp.mkdir(this.urlPrefix + '/build', { recursive: true });
    }
    return this.fsp.writeFile(path, code);
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

  async loadLibs(loadedLibs: Set<string>): Promise<ToolboxInfo> {
    let toolbox: ToolboxInfo = {
      kind: 'categoryToolbox',
      contents: [],
    };
    const libFiles = await this.jacLyFilesPromise;
    for (const libFile of libFiles) {
      const fileLib = await this.loadFileLib(libFile);
      // Check if the library name is already loaded
      if ('name' in fileLib && typeof fileLib.name === 'string') {
        if (!loadedLibs.has(fileLib.name)) {
          toolbox.contents = toolbox.contents.concat(fileLib);
          loadedLibs.add(fileLib.name);
        }
      } else {
        // If no name, add it anyway (or handle as needed)
        toolbox.contents = toolbox.contents.concat(fileLib);
      }
    }
    return toolbox;
  }

  async loadFileLib(libFile: string): Promise<ToolboxItemInfo> {
    if (!this.fs.existsSync(libFile)) {
      throw new Error(`Library file not found: ${libFile}`);
    }

    try {
      const fileContent = this.fs.readFileSync(libFile, 'utf-8');
      const result = JaclyConfigSchema.safeParse(JSON.parse(fileContent));
      if (result.success) {
        const libJson = result.data;

        // Track the library type to its imports
        this.libToImports.set(libJson.category, libJson.libraries || []);

        if (libJson.contents !== undefined) {
          // Register blocks
          for (const block of libJson.contents) {
            if (block.message0 !== undefined) {
              await registerBlocklyJs(
                block,
                libJson.colour,
                libJson.categorystyle
              );
            }
          }

          let toolboxInfo: ToolboxItemInfo = {
            kind: 'category',
            name: libJson.name,
            contents: libJson.contents,
            // Set category color so the UI can show proper colors in the toolbox
            colour: libJson.colour,
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

  getImportsForBlocks(blockTypes: string[]): string[] {
    const importsSet = new Set<string>();
    const libraryTypes = new Set<string>();
    for (const type of blockTypes) {
      const libType = type.split('_')[0];
      libraryTypes.add(libType);
    }
    for (const libType of libraryTypes) {
      const libs = this.libToImports.get(libType);
      if (libs) {
        libs.forEach((lib: string) => importsSet.add(lib));
      }
    }
    return Array.from(importsSet);
  }
}
