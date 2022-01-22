import { sound } from "@pixi/sound";
import { Renderer } from "./Renderer";
import { Stage } from "./gameObject/Stage";
import { Ball } from "./gameObject/Ball";
import { Paddle } from "./gameObject/Paddle";
import { Block } from "./gameObject/Block";
import { Player } from "./gameObject/Player";
import { CursorBall, FastBall, Item, MultiBall, ShortPaddle, WallItem, WidePaddle } from "./gameObject/Item";
import { ItemFactory } from "./gameObject/ItemFactory";
import { BallFactory } from "./gameObject/BallFactory";
import { EventEmitter } from "./util/EventEmitter";
import { isContains, isBlockAndBallConflicts } from "./util/HitTestUtil";
import { map } from "./util/MathUtil";

type GameEvent = {
  onBlockCollision: Block;
  onScoreChange: [currentBlocks: number, totalBlocks: number];
  onPlayerUpdate: Player;
  onItemGet: Item;
  onGameOver: void;
  onClear: void;
};

export class Breakout extends EventEmitter<GameEvent> {
  private state = "waiting";
  private totalBlockCount: number;

  private balls: Ball[] = [];
  private items: Item[] = [];

  private cursorBallEffect: ItemEffectDuration = new ItemEffectDuration();
  private wallEffect: ItemEffectDuration = new ItemEffectDuration();
  private paddleEffect: ItemEffectDuration = new ItemEffectDuration();
  private fastBallEffect: ItemEffectDuration = new ItemEffectDuration();

  private debugMode = false;

  constructor(
    private renderer: Renderer,
    private player: Player,
    private stage: Stage,
    private blocks: Block[],
    private paddle: Paddle,
    private ballFactory: BallFactory,
    private itemFactory: ItemFactory
  ) {
    super();
    this.totalBlockCount = blocks.length;
  }

  public init() {
    this.state = "waiting";
    this.balls = [this.getInitialBall()];
    this.items = [];
    this.paddle.x = this.stage.width / 2 - this.paddle.width / 2;
    this.paddle.y = this.stage.height - this.paddle.height;
    this.emitter.emit("onPlayerUpdate", this.player);
    this.emitter.emit("onScoreChange", [
      this.blocks.length,
      this.totalBlockCount,
    ]);
    this.draw();
  }

  public tick(delta: number) {
    this.balls.forEach((ball, index) => {
      const isCursorBall = index === 0 && this.cursorBallEffect.active;
      const nextBallPosition = this.fastBallEffect.active ? ball.nextPosition(delta * 1.5) : ball.nextPosition(delta);
      if (isCursorBall) {
        nextBallPosition.x = this.paddle.x + this.paddle.width / 2;
      }
      // 壁
      if (nextBallPosition.x < 0 || nextBallPosition.x > this.stage.width) {
        sound.play("wall");
        ball.velocity.x = -ball.velocity.x;
      }
      if (nextBallPosition.y < 0) {
        sound.play("wall");
        ball.velocity.y = -ball.velocity.y;
      }
      // 落下
      if (this.wallEffect.active) {
        if (nextBallPosition.y > this.stage.height) {
          sound.play("wall");
          ball.velocity.y = -ball.velocity.y;
        }
      } else {
        if (nextBallPosition.y > this.stage.height + ball.radius * 10) {
          const ballIndex = this.balls.indexOf(ball);
          if (ballIndex !== -1) {
            this.balls.splice(ballIndex, 1);
          }
          if (this.balls.length === 0) {
            this.onLifeDecreased();
          }
        }
      }

      // パドル
      if (isContains(this.paddle, nextBallPosition.x, nextBallPosition.y)) {
        ball.smash = false;
        const distance =
          nextBallPosition.x - this.paddle.x - this.paddle.width / 2;
        if (Math.abs(distance) < this.paddle.smashWidth) {
          sound.play("smash");
          ball.smash = true;
        } else {
          sound.play("hit");
        }
        ball.velocity.x = map(
          distance,
          -this.paddle.width / 2,
          this.paddle.width / 2,
          -8,
          8
        );
        ball.velocity.y = -ball.velocity.y;
      }
      // アイテム
      const itemsToDelete: number[] = [];
      this.items.forEach((item, index) => {
        const nextItemPosition = item.nextPosition(delta);
        if (nextItemPosition.y > this.stage.height + 50) {
          itemsToDelete.push(index);
          return;
        }
        if (isContains(this.paddle, nextItemPosition.x, nextItemPosition.y)) {
          sound.play("item");
          if (item instanceof WidePaddle) {
            this.paddle.status = "wide";
            this.paddleEffect.activate(item.duration, () => {
              this.paddle.status = "default";
            });
          } else if(item instanceof ShortPaddle) {
            this.paddle.status = "short";
            this.paddleEffect.activate(item.duration, () => {
              this.paddle.status = "default";
            });
          } else if (item instanceof FastBall) {
            this.fastBallEffect.activate(item.duration);
          } else if (item instanceof CursorBall) {
            this.cursorBallEffect.activate(item.duration);
          } else if (item instanceof WallItem) {
            this.wallEffect.activate(item.duration);
          } else if (item instanceof MultiBall && this.balls.length === 1) {
            for (let i = 0; i < item.numberOfBalls; i++) {
              this.addBall();
            }
          }
          this.emitter.emit("onItemGet", item);
        }
        item.position = nextItemPosition;
      });
      for (var i = itemsToDelete.length -1; i >= 0; i--)
        this.items.splice(itemsToDelete[i],1);

      // ブロック
      this.blocks.forEach((block) => {
        const conflictDirection = isBlockAndBallConflicts(block, ball);
        if (conflictDirection !== "none") {
          if (!ball.smash) {
            switch (conflictDirection) {
              case "top":
                ball.velocity.y = -ball.velocity.y;
                break;
              case "right":
                ball.velocity.x = -ball.velocity.x;
                break;
              case "bottom":
                ball.velocity.y = -ball.velocity.y;
                break;
              case "left":
                ball.velocity.x = -ball.velocity.x;
                break;
            }
          }

          sound.play("conflict");
          const blockIndex = this.blocks.indexOf(block);
          if (blockIndex) {
            this.blocks.splice(blockIndex, 1);
          }
          this.emitter.emit("onBlockCollision", block);
          this.emitter.emit("onScoreChange", [
            this.blocks.length,
            this.totalBlockCount,
          ]);
          this.addRandomItem(block);
          const achievement =
            (1 - this.blocks.length / this.totalBlockCount) * 100;
          if (achievement > this.stage.achievement) {
            this.init();
            this.state = "clear";
            sound.play("clear");
            this.emitter.emit("onClear");
          }
        }
      });
      ball.position = nextBallPosition;
    });
    this.draw();
  }

  public movePaddleLeft() {
    this.paddle.x -= 32;
    if (this.paddle.x < 0) {
      this.paddle.x = 0;
    }
  }

  public movePaddleRight() {
    this.paddle.x += 32;
    if (this.stage.width < this.paddle.x + this.paddle.width) {
      this.paddle.x = this.stage.width - this.paddle.width;
    }
  }

  public movePaddle(x: number) {
    this.paddle.x = x - this.paddle.width / 2;
    if (this.paddle.x < 0) {
      this.paddle.x = 0;
    }
    if (this.stage.width < this.paddle.x + this.paddle.width) {
      this.paddle.x = this.stage.width - this.paddle.width;
    }
  }

  public moveBall(x: number) {
    if (this.state !== "playing") {
      this.balls[0].x = Math.min(
        Math.max(this.balls[0].radius, x),
        this.stage.width - this.balls[0].radius
      );
    }
  }

  public releaseBall() {
    if (this.state !== "waiting") {
      return;
    }
    this.state = "playing";
    sound.play("throwBall");
    this.balls[0].velocity = this.balls[0].velocity0;
  }

  private onLifeDecreased() {
    this.player.life--;
    if (this.player.life <= 0) {
      this.init();
      this.state = "game-over";
      this.emitter.emit("onGameOver");
    } else {
      this.init();
    }
    sound.play("lifeDecreased");
    this.emitter.emit("onPlayerUpdate", this.player);
  }

  private addRandomItem(block: Block) {
    const item = this.itemFactory.getItem();
    if (item) {
      item.x = block.x + block.width / 2;
      item.y = block.y + block.height / 2;
      item.velocity.y = item.velocity0.y;
      this.items.push(item);
    }
  }

  private addBall() {
    const ball = this.getInitialBall();
    ball.x = this.paddle.x + this.paddle.width / 2;
    ball.y = this.paddle.y - ball.radius * 2;
    ball.velocity.x = ball.velocity0.x * 2 * (Math.random() - 0.5);
    ball.velocity.y = ball.velocity0.y;
    this.balls.push(ball);
  }

  private getInitialBall() {
    const ball = this.ballFactory.getBall();
    ball.position = {
      x: this.stage.width / 2,
      y: this.stage.height - this.paddle.height - ball.radius * 2,
    };
    ball.velocity = { x: 0, y: 0 };
    return ball;
  }

  private draw() {
    this.renderer.render(
      this.debugMode,
      this.stage,
      this.blocks,
      this.balls,
      this.paddle,
      this.items,
      this.wallEffect.active
    );
  }

  public toggleDebugMode() {
    this.debugMode = !this.debugMode;
  }

  public dispose() {
    this.renderer.dispose();
  }
}

class ItemEffectDuration {
  private timer: number|undefined;

  public activate(duration: number, onDeactivate?: () => void) {
    clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      clearTimeout(this.timer);
      this.timer = undefined;
      onDeactivate?.();
    }, duration * 1000);
  }

  get active(): boolean {
    return this.timer !== undefined;
  }
}
