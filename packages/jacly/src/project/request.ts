import { JaculusRequestError, RequestFunction } from '@jaculus/project/fs';
import * as path from 'path';
import * as fs from 'fs';

export const getRequest: RequestFunction = async (
  baseUri: string,
  libFile: string
): Promise<Uint8Array> => {
  if (baseUri.startsWith('http://') || baseUri.startsWith('https://')) {
    let response: Response;
    try {
      response = await fetch(new URL(libFile, baseUri), {
        cache: 'no-store',
      });
    } catch (error) {
      throw new JaculusRequestError(
        `Failed to fetch ${baseUri}${libFile}: ${(error as Error).message}`
      );
    }

    if (!response.ok) {
      throw new JaculusRequestError(
        `Failed to fetch ${baseUri}${libFile}: ${response.status} ${response.statusText}`
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } else if (baseUri.startsWith('file:')) {
    const uri = path.join(baseUri, libFile);
    const filePath = uri.replace(/^file:/, '');
    try {
      return new Uint8Array(await fs.promises.readFile(filePath));
    } catch (error) {
      throw new JaculusRequestError(
        `Failed to read ${filePath}: ${(error as Error).message}`
      );
    }
  } else {
    throw new JaculusRequestError(
      `Unsupported URI scheme in: ${baseUri} + ${libFile}`
    );
  }
};
