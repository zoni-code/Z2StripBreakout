import { BallConfig } from "../Config";
import { RadiusObject } from "./Base";

export class Ball extends RadiusObject {
  private _smash: boolean = false;
  constructor(config: BallConfig) {
    super();
    this.radius = config.radius;
    this.velocity0.x = config.speed;
    this.velocity0.y = -config.speed;
  }
  get smash(): boolean {
    return this._smash;
  }

  set smash(value: boolean) {
    this._smash = value;
  }
}
