import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { JacProject } from '@/lib/project/project';
import {
  JacProjectConfig,
  JacProjectType,
  ConnectionType,
} from '@/lib/project/external/project-config';
import { useJac } from '@/jaculus/provider/jac-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectionCard } from '@/components/ui/selection-card';
import { useIntlayer } from 'react-intlayer';

export function SelectNewProject() {
  const navigate = useNavigate();
  const { setProject } = useJac();
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<JacProjectType>('jacly');
  const [connectionType] = useState<ConnectionType>('web-serial');
  const content = useIntlayer('newProject');

  const handleCreateProject = () => {
    const newProjectConfig: JacProjectConfig = {
      name: projectName || 'New Project',
      uuid: crypto.randomUUID(),
      created: new Date(),
      lastModified: new Date(),
      jaculusVersion: '0.1.0',
      projectType,
      connectionType,
    };
    const newProject = new JacProject(newProjectConfig);
    setProject(newProject);
    navigate({ to: '/editor', search: { connection: connectionType } });
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">{content.createNewProject}</h1>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="projectName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {content.projectName}
          </label>
          <Input
            id="projectName"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            placeholder={content.myAwesomeProject.value}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">{content.projectType}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectionCard
              title={content.jaclyProject as string}
              description={content.jaclyProjectDescription.value}
              isSelected={projectType === 'jacly'}
              onSelect={() => setProjectType('jacly')}
            />
            <SelectionCard
              title={content.jaculusProject as string}
              description={content.jaculusProjectDescription.value}
              isSelected={projectType === 'code'}
              onSelect={() => setProjectType('code')}
            />
          </div>
        </div>

        {/* <div>
          <h2 className="text-lg font-semibold mb-2">
            Default Connection Method
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectionCard
              title="Web Serial"
              description="Connect via USB."
              isSelected={connectionType === 'web-serial'}
              onSelect={() => setConnectionType('web-serial')}
            />
            <SelectionCard
              title="Web Bluetooth"
              description="Wireless connection."
              isSelected={connectionType === 'web-bluetooth'}
              onSelect={() => setConnectionType('web-bluetooth')}
            />
            <SelectionCard
              title="Wokwi"
              description="Simulator connection."
              isSelected={connectionType === 'wokwi'}
              onSelect={() => setConnectionType('wokwi')}
            />
          </div>
        </div> */}

        <Button onClick={handleCreateProject} className="w-full">
          {content.createProject}
        </Button>
      </div>
    </div>
  );
}
