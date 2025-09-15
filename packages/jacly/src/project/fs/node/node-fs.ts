import * as fsp from 'node:fs/promises';
import { UniversalFS } from '../universal-fs';

export function createNodeFS(): UniversalFS {
  return {
    mkdir: (p, o) => fsp.mkdir(p, { recursive: o?.recursive ?? true }),
    writeFile: (p, d) => fsp.writeFile(p, d as any),
    readFile: p => fsp.readFile(p),
    readdir: p => fsp.readdir(p),
    stat: p => fsp.stat(p),
  };
}
