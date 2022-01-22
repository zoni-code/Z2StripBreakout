export type GameConfig = {
  pcSplit: number;
  spSplit: number;
  life: number;
  achievement: number;
}

export class GameConfigForm {
  public getGameConfig(): GameConfig {
    return {
      pcSplit: this.getPcBlockConfig(),
      spSplit: this.getSpBlockConfig(),
      achievement: this.getAchievementConfig(),
      life: this.getPlayerLifeConfig()
    }
  }

  private getPcBlockConfig() {
    const value = document.querySelector<HTMLInputElement>(
      "input[name=pcSplit]"
    )?.value;
    return value ? parseInt(value, 10) : 48;
  }

  private getSpBlockConfig() {
    const value = document.querySelector<HTMLInputElement>(
      "input[name=spSplit]"
    )?.value;
    return value ? parseInt(value, 10) : 32;
  }

  private getAchievementConfig() {
    const value = document.querySelector<HTMLInputElement>(
      "input[name=achievement]"
    )?.value;
    return value ? parseInt(value, 10) : 70;
  }

  private getPlayerLifeConfig() {
    const value =
      document.querySelector<HTMLInputElement>("input[name=life]")?.value;
    return value ? parseInt(value, 10) : 70;
  }
}
