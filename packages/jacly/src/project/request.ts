import { RequestFunction } from '@jaculus/project/fs';
import * as path from 'path';
import * as fs from 'fs';

export const getRequest: RequestFunction = async (
  baseUri: string,
  libFile: string
): Promise<Uint8Array> => {
  if (baseUri.startsWith('http://') || baseUri.startsWith('https://')) {
    const response = await fetch(new URL(libFile, baseUri), {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${baseUri}: ${response.status} ${response.statusText}`
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } else if (baseUri.startsWith('file:')) {
    const uri = path.join(baseUri, libFile);
    const filePath = uri.replace(/^file:/, '');
    return new Uint8Array(await fs.promises.readFile(filePath));
  } else {
    throw new Error(`Unsupported URI scheme in: ${baseUri} + ${libFile}`);
  }
};
