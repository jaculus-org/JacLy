import {
  AppSettingsRepository as SettingsRepository,
  db,
  logger,
  ProjectRepository,
  SettingsService,
} from '@/core';
import { ConsoleBusService } from '@/console';
import { ProjectFsService, ProjectManagementService } from '@/project';

export type RouterContext = ReturnType<typeof makeRouterContext>;

export function makeRouterContext() {
  const projectRepo = new ProjectRepository(db);
  const settingsRepo = new SettingsRepository(db);

  const projectManService = new ProjectManagementService(projectRepo);
  const settingsService = new SettingsService(settingsRepo);
  const projectFsService = new ProjectFsService();
  const streamBusService = new ConsoleBusService();

  return {
    db,
    projectManService,
    settingsService,
    projectFsService,
    streamBusService,
    loggerBus: logger,
  };
}
