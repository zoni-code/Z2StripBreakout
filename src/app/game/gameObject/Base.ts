export type Point = {
  x: number;
  y: number;
};

export type Vector = {
  x: number;
  y: number;
};

class MoveObject {
  private _position: Point = { x: 0, y: 0 };
  private _velocity: Vector = { x: 0, y: 0 };
  private _velocity0: Vector = { x: 0, y: 0 };

  get position(): Point {
    return this._position;
  }

  set position(value: Point) {
    this._position = value;
  }

  get x(): number {
    return this._position.x;
  }

  set x(value: number) {
    this._position.x = value;
  }

  get y(): number {
    return this._position.y;
  }

  set y(value: number) {
    this._position.y = value;
  }

  get velocity(): Vector {
    return this._velocity;
  }

  set velocity(value: Vector) {
    this._velocity = value;
  }

  get velocity0(): Vector {
    return this._velocity0;
  }

  set velocity0(value: Vector) {
    this._velocity0 = value;
  }

  public nextPosition(delta: number) {
    return { x: this.x + this.velocity.x * delta, y: this.y + this.velocity.y * delta };
  }
}

export class RadiusObject extends MoveObject {
  private _radius: number;

  get radius(): number {
    return this._radius;
  }

  set radius(value: number) {
    this._radius = value;
  }
}

export class RectObject extends MoveObject {
  protected _width: number;
  private _height: number;

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

  get x(): number {
    return this.position.x;
  }

  set x(value: number) {
    this.position.x = value;
  }

  get y(): number {
    return this.position.y;
  }

  set y(value: number) {
    this.position.y = value;
  }
  get top(): number {
    return this.position.y;
  }

  get left(): number {
    return this.position.x;
  }

  get bottom(): number {
    return this.position.y + this.height;
  }

  get right(): number {
    return this.position.x + this.width;
  }
}
