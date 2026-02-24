import { AppSettingsRepository as SettingsRepository } from '@/lib/db/app-settings-repository';
import { db } from '@/lib/db/db';
import { ProjectRepository } from '@/lib/db/project-repository';
import { ProjectFsService } from '@/services/project-fs-service';
import { ProjectManagementService } from '@/services/project-runtime-service';
import { SettingsService } from '@/services/settings-service';
import { StreamBusService } from '@/services/stream-bus-service';

export type RouterContext = ReturnType<typeof makeRouterContext>;

export function makeRouterContext() {
  const projectRepo = new ProjectRepository(db);
  const settingsRepo = new SettingsRepository(db);

  const projectManService = new ProjectManagementService(projectRepo);
  const settingsService = new SettingsService(settingsRepo);
  const projectFsService = new ProjectFsService();
  const streamBusService = new StreamBusService();

  return {
    db,
    projectManService,
    settingsService,
    projectFsService,
    streamBusService,
  };
}
