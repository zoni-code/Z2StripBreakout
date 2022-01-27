import * as PIXI from "pixi.js";
import { Block } from "./gameObject/Block";
import { Ball } from "./gameObject/Ball";
import { Paddle } from "./gameObject/Paddle";
import {
  CursorBall,
  FastBall,
  Item,
  MultiBall,
  ShortPaddle,
  WallItem,
  WidePaddle,
} from "./gameObject/Item";
import { Stage } from "./gameObject/Stage";
import { SpritePool } from "./util/SpritePool";

const SPRITE_POOL_SIZE = 5;

export class Renderer {
  private graphics: PIXI.Graphics;
  private sprites: PIXI.Container;
  private multiBallSpritePool: SpritePool;
  private cursorBallSpritePool: SpritePool;
  private wallItemSpritePool: SpritePool;
  private wideItemSpritePool: SpritePool;
  private shortItemSpritePool: SpritePool;
  private fastBallSpritePool: SpritePool;

  constructor(app: PIXI.Application) {
    this.graphics = new PIXI.Graphics();
    this.sprites = new PIXI.Container();
    this.multiBallSpritePool = new SpritePool(
      SPRITE_POOL_SIZE,
      app,
      require("./image/item_multi.png")
    );
    this.cursorBallSpritePool = new SpritePool(
      SPRITE_POOL_SIZE,
      app,
      require("./image/item_cursor.png")
    );
    this.wallItemSpritePool = new SpritePool(
      SPRITE_POOL_SIZE,
      app,
      require("./image/item_wall.png")
    );
    this.wideItemSpritePool = new SpritePool(
      SPRITE_POOL_SIZE,
      app,
      require("./image/item_wide.png")
    );
    this.shortItemSpritePool = new SpritePool(
      SPRITE_POOL_SIZE,
      app,
      require("./image/item_short.png")
    );
    this.fastBallSpritePool = new SpritePool(
      SPRITE_POOL_SIZE,
      app,
      require("./image/item_fast.png")
    );
    app.stage.addChild(this.graphics);
    app.stage.addChild(this.sprites);
  }

  public render(
    debugMode: boolean,
    stage: Stage,
    block: Block[],
    balls: Ball[],
    paddle: Paddle,
    items: Item[],
    usingWall: boolean
  ) {
    this.graphics.clear();

    if (debugMode) {
      block.forEach((block) => {
        this.graphics.beginFill(0x000099, 0.5);
        this.graphics.drawRect(block.x, block.y, block.width, block.height);
        this.graphics.endFill();
      });
    }

    if (usingWall) {
      this.graphics.beginFill(0x00ccff, 0.5);
      this.graphics.drawRect(
        0,
        stage.height - paddle.height,
        stage.width,
        paddle.height
      );
      this.graphics.endFill();
    }

    items.forEach((item, index) => {
      let sprite = null;
      if (item instanceof ShortPaddle) {
        sprite = this.shortItemSpritePool.borrow();
      } else if (item instanceof FastBall) {
        sprite = this.fastBallSpritePool.borrow();
      } else if (item instanceof WidePaddle) {
        sprite = this.wideItemSpritePool.borrow();
      } else if (item instanceof MultiBall) {
        sprite = this.multiBallSpritePool.borrow();
      } else if (item instanceof CursorBall) {
        sprite = this.cursorBallSpritePool.borrow();
      } else if (item instanceof WallItem) {
        sprite = this.wallItemSpritePool.borrow();
      }
      if (sprite) {
        sprite.x = item.x;
        sprite.y = item.y;
        sprite.width = item.width;
        sprite.height = item.height;
      }
    });
    this.fastBallSpritePool.resetUnused();
    this.multiBallSpritePool.resetUnused();
    this.cursorBallSpritePool.resetUnused();
    this.wallItemSpritePool.resetUnused();
    this.shortItemSpritePool.resetUnused();
    this.wideItemSpritePool.resetUnused();

    balls.forEach((ball) => {
      this.graphics.beginFill(0xffffff);
      if (ball.smash) {
        this.graphics.beginFill(0xff0000);
      }
      this.graphics.lineStyle(1, 0x000000);
      this.graphics.drawEllipse(ball.x, ball.y, ball.radius, ball.radius);
      this.graphics.endFill();
    });

    this.graphics.beginFill(0xff0000);
    this.graphics.drawEllipse(
      paddle.x + paddle.height / 2,
      paddle.y + paddle.height / 2,
      paddle.height / 2,
      paddle.height / 2
    );
    this.graphics.endFill();

    this.graphics.beginFill(0xff0000);
    this.graphics.drawEllipse(
      paddle.x + paddle.width - paddle.height / 2,
      paddle.y + paddle.height / 2,
      paddle.height / 2,
      paddle.height / 2
    );
    this.graphics.endFill();

    this.graphics.beginFill(0xffffff);
    this.graphics.lineStyle(1, 0xff0000);
    this.graphics.drawRect(
      paddle.x + paddle.height / 2,
      paddle.y,
      paddle.width - paddle.height,
      paddle.height
    );
    this.graphics.endFill();

    this.graphics.beginFill(0xffffff);
    this.graphics.lineStyle(2, 0xff0000);
    this.graphics.drawRect(
      paddle.x + paddle.width / 2,
      paddle.y,
      2,
      paddle.height
    );
    this.graphics.endFill();
  }

  public dispose() {
    this.multiBallSpritePool.dispose();
    this.cursorBallSpritePool.dispose();
    this.wallItemSpritePool.dispose();
    this.shortItemSpritePool.dispose();
    this.wideItemSpritePool.dispose();
  }
}
