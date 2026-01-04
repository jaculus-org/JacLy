import { AppSettingsRepository as SettingsRepository } from '@/lib/db/app-settings-repository';
import { db } from '@/lib/db/db';
import { ProjectRepository } from '@/lib/db/project-repository';
import { ProjectFsService } from '@/services/project-fs-service';
import { ProjectRuntimeService } from '@/services/project-runtime-service';
import { SettingsService } from '@/services/settings-service';

export type RouterContext = ReturnType<typeof makeRouterContext>;

export function makeRouterContext() {
  const projectRepo = new ProjectRepository(db);
  const settingsRepo = new SettingsRepository(db);

  const runtimeService = new ProjectRuntimeService(projectRepo);
  const settingsService = new SettingsService(settingsRepo);
  const projectFsService = new ProjectFsService();

  return {
    db,
    runtimeService,
    settingsService,
    projectFsService,
  };
}
