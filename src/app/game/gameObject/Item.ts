import {
  CursorBallConfig, FastBallConfig, ItemConfig, MultiBallConfig, ShortPaddleConfig, WallItemConfig, WidePaddleConfig
} from "../Config";
import { RectObject } from "./Base";

export class Item extends RectObject { }

export class FastBall extends Item {
  private _duration: number;
  private _coefficient: number;

  constructor(config: FastBallConfig, itemConfig: ItemConfig) {
    super();
    this._duration = config.duration;
    this._coefficient = config.coefficient;
    this.width = itemConfig.width;
    this.height = itemConfig.height;
    this.velocity = { x: 0, y: 0 };
    this.velocity0 = { x: 0, y: itemConfig.speed };
  }

  get duration(): number {
    return this._duration;
  }

  get coefficient(): number {
    return this._coefficient;
  }
}

export class WidePaddle extends Item {
  private _duration: number;

  constructor(config: WidePaddleConfig, itemConfig: ItemConfig) {
    super();
    this._duration = config.duration;
    this.width = itemConfig.width;
    this.height = itemConfig.height;
    this.velocity = { x: 0, y: 0 };
    this.velocity0 = { x: 0, y: itemConfig.speed };
  }

  get duration(): number {
    return this._duration;
  }
}

export class ShortPaddle extends Item {
  private _duration: number;

  constructor(config: ShortPaddleConfig, itemConfig: ItemConfig) {
    super();
    this._duration = config.duration;
    this.width = itemConfig.width;
    this.height = itemConfig.height;
    this.velocity = { x: 0, y: 0 };
    this.velocity0 = { x: 0, y: itemConfig.speed };
  }

  get duration(): number {
    return this._duration;
  }
}

export class WallItem extends Item {
  private _duration: number;

  constructor(config: WallItemConfig, itemConfig: ItemConfig) {
    super();
    this._duration = config.duration;
    this.width = itemConfig.width;
    this.height = itemConfig.height;
    this.velocity = { x: 0, y: 0 };
    this.velocity0 = { x: 0, y: itemConfig.speed };
  }

  get duration(): number {
    return this._duration;
  }
}

export class MultiBall extends Item {
  private _numberOfBalls: number;

  constructor(config: MultiBallConfig, itemConfig: ItemConfig) {
    super();
    this._numberOfBalls = config.balls;
    this.width = itemConfig.width;
    this.height = itemConfig.height;
    this.velocity = { x: 0, y: 0 };
    this.velocity0 = { x: 0, y: itemConfig.speed };
  }

  get numberOfBalls(): number {
    return this._numberOfBalls;
  }
}

export class CursorBall extends Item {
  private _duration: number;

  constructor(config: CursorBallConfig, itemConfig: ItemConfig) {
    super();
    this._duration = config.duration;
    this.width = itemConfig.width;
    this.height = itemConfig.height;
    this.velocity = { x: 0, y: 0 };
    this.velocity0 = { x: 0, y: itemConfig.speed };
  }

  get duration(): number {
    return this._duration;
  }
}
