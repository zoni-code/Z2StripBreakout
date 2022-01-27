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
import { SoundPlayer } from "./SoundPlayer";

type GameEvent = {
  onBlockCollision: Block;
  onScoreChange: [currentBlocks: number, totalBlocks: number];
  onPlayerUpdate: Player;
  onItemGet: Item;
  onGameOver: void;
  onClear: void;
};

type GameState = "waiting" | "playing" | "game-over" | "clear";

export class Breakout extends EventEmitter<GameEvent> {
  private state: GameState = "waiting";
  private totalBlockCount: number;

  private balls: Ball[] = [];
  private items: Item[] = [];

  private cursorBallEffect: ItemEffectDuration = new ItemEffectDuration();
  private wallEffect: ItemEffectDuration = new ItemEffectDuration();
  private paddleEffect: ItemEffectDuration = new ItemEffectDuration();
  private fastBallEffect: ItemEffectDuration = new ItemEffectDuration();

  private ballVelocityCoefficient = 1;

  private debugMode = false;

  constructor(
    private renderer: Renderer,
    private sound: SoundPlayer,
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

  public toWaiting() {
    this.state = "waiting";
    this.balls = [this.getInitialBall()];
    this.items = [];
    this.paddle.x = this.stage.width / 2 - this.paddle.width / 2;
    this.paddle.y = this.stage.height - this.paddle.height;
    this.cursorBallEffect.deactivate();
    this.wallEffect.deactivate();
    this.paddleEffect.deactivate();
    this.fastBallEffect.deactivate();
    this.emitter.emit("onPlayerUpdate", this.player);
    this.emitter.emit("onScoreChange", [
      this.blocks.length,
      this.totalBlockCount,
    ]);
    this.draw();
  }

  public toPlaying() {
    this.state = "playing";
    this.sound.play("throwBall");
    this.balls[0].velocity = this.balls[0].velocity0;
  }

  private toClear() {
    this.toWaiting();
    this.state = "clear";
    this.sound.play("clear");
    this.emitter.emit("onClear");
  }

  private toGameOver() {
    this.toWaiting();
    this.state = "game-over";
    this.emitter.emit("onGameOver");
  }

  public tick(delta: number) {
    this.balls.forEach((ball, index) => {
      const isCursorBall = index === 0 && this.cursorBallEffect.active;
      const nextBallPosition = this.fastBallEffect.active ? ball.nextPosition(delta * this.ballVelocityCoefficient) : ball.nextPosition(delta);
      if (isCursorBall) {
        nextBallPosition.x = this.paddle.x + this.paddle.width / 2;
      }
      // 壁
      if (nextBallPosition.x < 0 || nextBallPosition.x > this.stage.width) {
        this.sound.play("wall");
        ball.velocity.x = -ball.velocity.x;
      }
      if (nextBallPosition.y < 0) {
        this.sound.play("wall");
        ball.velocity.y = -ball.velocity.y;
      }
      // 落下
      if (this.wallEffect.active) {
        if (nextBallPosition.y > this.stage.height) {
          this.sound.play("wall");
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
          this.sound.play("smash");
          ball.smash = true;
        } else {
          this.sound.play("hit");
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
        if (isContains(this.paddle, nextItemPosition.x + item.width / 2, nextItemPosition.y + item.height / 2)) {
          this.sound.play("item");
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
            this.ballVelocityCoefficient = item.coefficient;
            this.fastBallEffect.activate(item.duration, () => {
              this.ballVelocityCoefficient = 1;
            });
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
      for (let i = itemsToDelete.length -1; i >= 0; i--) {
        this.items.splice(itemsToDelete[i], 1);
      }

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

          this.sound.play("conflict");
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
            this.toClear();
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

  private onLifeDecreased() {
    this.player.life--;
    this.sound.play("lifeDecreased");
    this.emitter.emit("onPlayerUpdate", this.player);

    if (this.player.life <= 0) {
      this.toGameOver();
    } else {
      this.toWaiting();
    }
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
      this.deactivate();
      onDeactivate?.();
    }, duration * 1000);
  }

  public deactivate() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }

  get active(): boolean {
    return this.timer !== undefined;
  }
}
