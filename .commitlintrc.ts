import type { UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

const Configuration: UserConfig = {
  rules: {
    "header-max-length": [RuleConfigSeverity.Error, "always", 200],
  },
};

export default Configuration;