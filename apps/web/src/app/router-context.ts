import { AppSettingsRepository, db, logger, ProjectRepository } from '@/core';
import { ConsoleBusService } from '@/console';
import { ProjectFsService, ProjectManagementService } from '@/project';

export type RouterContext = ReturnType<typeof makeRouterContext>;

export function makeRouterContext() {
  const projectRepo = new ProjectRepository(db);
  const settingsRepo = new AppSettingsRepository(db);

  const projectManService = new ProjectManagementService(projectRepo);
  const projectFsService = new ProjectFsService();
  const streamBusService = new ConsoleBusService();

  return {
    db,
    projectManService,
    settingsRepo,
    projectFsService,
    streamBusService,
    loggerBus: logger,
  };
}
