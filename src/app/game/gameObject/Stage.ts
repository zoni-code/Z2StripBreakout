export class Stage {
  constructor(
    private _width: number,
    private _height: number,
    private _achievement: number
  ) {}

  get width(): number {
    return this._width;
  }

  set width(value: number) {
    this._width = value;
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    this._height = value;
  }

  get achievement() {
    return this._achievement;
  }
}
