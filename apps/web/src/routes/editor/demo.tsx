import {
  getProjectById,
  JacProject,
  saveProject,
} from '@/lib/project/jacProject.ts';
import FS from '@isomorphic-git/lightning-fs';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/editor/demo')({
  // In a loader
  // loader: ({ params }) => getProjectById(params.projectId),
  // Or in a component
  component: PostComponent,
});

function PostComponent() {
  // In a component!
  const projectId = '123';
  const data = Route.useLoaderData();
  const [readme, setReadme] = useState<string | null>(null);
  const fs = new FS(projectId!);

  useEffect(() => {
    const loadReadme = async () => {
      try {
        const content = await fs.promises.readFile('README.md');
        setReadme(content.toString());
      } catch {
        setReadme(null);
      }
    };
    loadReadme();
  }, [projectId]);

  function addProjectDataNew() {
    const project: JacProject = {
      name: 'New Project' + projectId,
      id: projectId!,
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false,
      archived: null,
      jaculusVersion: '0.1.0',
      type: 'jacly',
    };

    saveProject(project);
  }

  return (
    <div>
      <h1>Project ID: {projectId}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>

      <button
        onClick={() => {
          addProjectDataNew();
        }}
      >
        Add Project
      </button>

      <button
        onClick={() => {
          console.log(getProjectById(projectId!));
        }}
      >
        Get Project
      </button>

      {readme ? <pre>{readme}</pre> : <p>No README.md file found.</p>}

      <button
        onClick={async () => {
          const fs = new FS(projectId!);
          fs.writeFile(
            'README.md',
            '# Project ' +
              projectId +
              '\nThis is the README for project ' +
              projectId,
            undefined,
            err => {
              if (err) {
                console.error(err);
                return;
              }
              // setReadme('# Project ' + projectId + '\nThis is the README for project ' + projectId);
            }
          );
        }}
      >
        Create/Update README.md
      </button>

      <hr />
      <button
        onClick={() => {
          fs.mkdir('src', undefined, err => console.log(err));
        }}
      >
        Create src/ directory
      </button>
    </div>
  );
}
