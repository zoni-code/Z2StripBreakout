import { PlayerConfig } from "../Config";

export class Player {
  private _life: number;

  constructor(config: PlayerConfig) {
    this._life = config.life;
  }

  get life(): number {
    return this._life;
  }

  set life(value: number) {
    this._life = value;
  }
}
