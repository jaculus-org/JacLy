import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'perf',
        'refactor',
        'revert',
        'style',
        'test',
      ],
    ],
    'subject-case': [RuleConfigSeverity.Error, 'never', ['pascal-case', 'upper-case']],
    'subject-max-length': [RuleConfigSeverity.Error, 'always', 200],
    'header-max-length': [RuleConfigSeverity.Error, 'always', 200],
    'body-max-line-length': [RuleConfigSeverity.Warning, 'always', 100],
    'footer-max-line-length': [RuleConfigSeverity.Warning, 'always', 100],
  },
};

export default Configuration;