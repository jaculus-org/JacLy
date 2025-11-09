import { generateSchema } from './generateSchema.ts';
import { generateTsLibsZip } from './generateTsLibsZip.ts';
import { generateTarGz } from './generateTarGz.ts';

generateSchema();
generateTsLibsZip();
generateTarGz('../../test/data/test-project', 'public/project.tar.gz');
