export class JaclyError extends Error {
  constructor(message: string) {
    super(`Jacly Error: ${message}`);
    this.name = 'JaclyError';
  }
}

export class JaclyBlockLoadError extends JaclyError {
  constructor(message: string) {
    super(`Jacly Block Load Error: ${message}`);
    this.name = 'JaclyBlockLoadError';
  }
}

export class JaclyBlockParseError extends JaclyError {
  constructor(message: string) {
    super(`Jacly Block Parse Error: ${message}`);
    this.name = 'JaclyBlockParseError';
  }
}

export class JaclyInvalidConfigError extends JaclyError {
  constructor(message: string) {
    super(`Jacly Invalid Config Error: ${message}`);
    this.name = 'JaclyInvalidConfigError';
  }
}
