import { RectObject } from "./Base";

export class Block extends RectObject {
  private _id: number;

  constructor(id: number, x: number, y: number, width: number, height: number) {
    super();
    this.id = id;
    this.position = { x, y };
    this.width = width;
    this.height = height;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }
}
