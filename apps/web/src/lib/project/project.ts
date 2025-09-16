import { JacProjectConfig } from './external/project-config';

export class JacProject {
  config: JacProjectConfig;

  constructor(config: JacProjectConfig) {
    this.config = config;
  }
}
