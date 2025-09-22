import { storage, STORAGE_KEYS } from '@/lib/storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { JacDevice } from '@jaculus/device';
import {
  deleteProject,
  JacProject,
  JacProjectMap,
  loadProjects,
  saveProject,
  getProjectById,
} from '@/lib/project/jacProject.ts';

type JacProviderProps = {
  children: React.ReactNode;
  storageKey?: string;
};

type JacProviderState = {
  device: JacDevice | null;
  // connect and disconnect device
  setDevice: (device: JacDevice | null) => void;

  projects: JacProjectMap;

  activeProject: JacProject | null;
  setActiveProject: (project: JacProject | null) => void;
  refreshActiveProject: () => void;
  deleteProject: (id: string) => void;

  setGeneratedCode: (code: string) => void;
  generatedCode: string;
};

const initialState: JacProviderState = {
  setGeneratedCode: () => null,
  generatedCode: '',
  device: null,
  projects: {},
  activeProject: null,
  setActiveProject: () => null,
  refreshActiveProject: () => null,
  deleteProject: () => null,
  setDevice: () => null,
};

const JacProviderContext = createContext<JacProviderState>(initialState);

export function JacProvider({
  children,
  storageKey = STORAGE_KEYS.JACLY,
  ...props
}: JacProviderProps) {
  const [generatedCode, setGeneratedCode] = useState<string>(
    storage.get(storageKey, '')
  );
  const [device, setDevice] = useState<JacDevice | null>(null);
  const [activeProject, setActiveProject] = useState<JacProject | null>(
    storage.get(STORAGE_KEYS.ACTIVE_PROJECT, null)
  );
  const [projects, setProjects] = useState<JacProjectMap>(
    loadProjects().reduce((map, project) => {
      map[project.id] = project;
      return map;
    }, {} as JacProjectMap)
  );

  useEffect(() => {
    storage.set(storageKey, generatedCode);
  }, [generatedCode, storageKey]);

  const value = {
    device,
    setDevice: (newDevice: JacDevice | null) => {
      if (device !== null) {
        device.destroy();
      }
      setDevice(newDevice);
    },

    projects: projects,
    activeProject: activeProject,
    setActiveProject: (project: JacProject | null) => {
      setActiveProject(project);
      if (project) {
        const existingProject = projects[project.id];
        if (!existingProject) {
          setProjects(prevProjects => ({
            ...prevProjects,
            [project.id]: project,
          }));
          saveProject(project);
        }
      }
      storage.set(STORAGE_KEYS.ACTIVE_PROJECT, project);
    },

    deleteProject: (id: string) => {
      setProjects(prevProjects => {
        const updatedProjects = { ...prevProjects };
        delete updatedProjects[id];
        return updatedProjects;
      });
      if (activeProject?.id === id) {
        setActiveProject(null);
        storage.remove(STORAGE_KEYS.ACTIVE_PROJECT);
      }
      const existingProject = projects[id];
      if (existingProject) {
        deleteProject(id);
      }
    },

    refreshActiveProject: () => {
      if (activeProject) {
        const updatedProject = getProjectById(activeProject.id);
        if (updatedProject) {
          setActiveProject(updatedProject);
          setProjects(prevProjects => ({
            ...prevProjects,
            [updatedProject.id]: updatedProject,
          }));
        }
      }
    },

    setGeneratedCode: (code: string) => {
      storage.set(storageKey, code);
      setGeneratedCode(code);
    },
    generatedCode,
  };

  return (
    <JacProviderContext.Provider {...props} value={value}>
      {children}
    </JacProviderContext.Provider>
  );
}

export const useJac = () => {
  const context = useContext(JacProviderContext);

  if (context === undefined)
    throw new Error('useJac must be used within a JacProvider');

  return context;
};
