import { Config, defaultStageConfig } from "../game/Config";
import { PartialDeep } from "type-fest";
import merge from "lodash-es/merge";

export class ConfigBuilder {
  build(userConfig: PartialDeep<Config>): Config | null {
    if (!userConfig.stages) {
      return null;
    }
    for (let i = 0; i < userConfig.stages.length; i++) {
      userConfig.stages[i] = merge(
        {},
        defaultStageConfig,
        userConfig.stages[i]
      );
    }
    return userConfig as Config;
  }
}
