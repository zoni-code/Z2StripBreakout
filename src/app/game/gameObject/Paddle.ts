import { PaddleConfig } from "../Config";
import { RectObject } from "./Base";

type PaddleStatus = "default" | "wide" | "short";

export class Paddle extends RectObject {
  private _smashWidth: number;
  private _status: PaddleStatus = "default";

  constructor(config: PaddleConfig) {
    super();
    this.x = 0;
    this.y = 0;
    this.width = config.width;
    this.height = config.height;
    this.smashWidth = config.smashWidth;
  }

  get smashWidth(): number {
    return this._smashWidth;
  }

  set smashWidth(value: number) {
    this._smashWidth = value;
  }

  get width(): number {
    if (this._status === "wide") {
      return this._width * 1.5;
    } else if (this._status === "short") {
      return this._width * 0.5;
    }
    return this._width;
  }

  set width(value: number) {
    this._width = value;
  }

  get status(): PaddleStatus {
    return this._status;
  }

  set status(value: PaddleStatus) {
    this._status = value;
  }
}
