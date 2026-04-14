import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { jaclyJsonSchema } from '@jaculus/jacly/schema';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../public/schema.json');

const schema = jaclyJsonSchema();
writeFileSync(outputPath, JSON.stringify(schema, null, 2));

console.log(`Schema written to ${outputPath}`);
