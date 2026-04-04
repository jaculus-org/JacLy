import { AppSettingsRepository as SettingsRepository } from '@/core/db/app-settings-repository';
import { db } from '@/core/db/db';
import { ProjectRepository } from '@/core/db/project-repository';
import { ProjectFsService } from '@/project';
import { ProjectManagementService } from '@/project';
import { SettingsService } from '@/core/services/settings-service';
import { logger } from '@/core/services/logger-service';
import { ConsoleBusService } from '@/console';

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
