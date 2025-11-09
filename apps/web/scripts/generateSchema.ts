import { projectJsonSchema } from '@jaculus/project';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export function generateSchema() {
  const workspaceRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..'
  );
  const outputSchema = path.join(
    workspaceRoot,
    'public',
    'schema',
    'project.json'
  );
  if (!fs.existsSync(path.dirname(outputSchema))) {
    fs.mkdirSync(path.dirname(outputSchema), { recursive: true });
  }

  const schema = projectJsonSchema();
  fs.writeFileSync(outputSchema, JSON.stringify(schema, null, 2), 'utf-8');
  console.log(`Generated schema at ${outputSchema}`);
}
