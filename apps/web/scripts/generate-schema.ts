import { jaclyJsonSchema } from '@jaculus/jacly/blocks';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../public/schema.json');

const schema = jaclyJsonSchema();
writeFileSync(outputPath, JSON.stringify(schema, null, 2));

console.log(`Schema written to ${outputPath}`);
