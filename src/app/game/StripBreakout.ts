import * as PIXI from "pixi.js";
import { StageConfig } from "./Config";
import { StripSheet } from "./StripSheet";
import { BlockGenerator } from "./BlockGenerator";
import { Paddle } from "./gameObject/Paddle";
import { Stage } from "./gameObject/Stage";
import { Renderer } from "./Renderer";
import { Breakout } from "./Breakout";
import { Keyboard } from "./Keyboard";
import { Player } from "./gameObject/Player";
import { EventEmitter } from "./util/EventEmitter";
import { sound } from "@pixi/sound";
import { Block } from "./gameObject/Block";
import { BallFactory } from "./gameObject/BallFactory";
import { ItemFactory } from "./gameObject/ItemFactory";
import { Item } from "./gameObject/Item";

type StripBreakoutEvent = {
  onPlayerUpdate: Player;
  onScoreChange: [currentBlocks: number, totalBlocks: number];
  onItemGet: Item;
  onGameOver: void;
  onClear: void;
};

export class StripBreakout extends EventEmitter<StripBreakoutEvent> {

  private game: Breakout;

  constructor(private app: PIXI.Application, private config: StageConfig) {
    super();
    this.app.ticker.maxFPS = 60;
  }

  public async start() {
    sound.add("hit", require("./sound/hit.mp3"));
    sound.add("conflict", require("./sound/conflict.mp3"));
    sound.add("wall", require("./sound/wall.mp3"));
    sound.add("throwBall", require("./sound/throwBall.mp3"));
    sound.add("clear", require("./sound/clear.mp3"));
    sound.add("smash", require("./sound/smash.mp3"));
    sound.add("item", require("./sound/item.mp3"));
    sound.add("lifeDecreased", require("./sound/lifeDecreased.mp3"));

    const sheet = new StripSheet(this.app, this.config.image);
    await sheet.init();

    const blockGenerator = new BlockGenerator();

    let blockImage = null;
    if (this.config.image.type === "foregroundasblock") {
      blockImage = await blockGenerator.loadBlockImage(this.config.image.foreground)
    }
    if (this.config.image.type === "blockimage" && this.config.image.block) {
      blockImage = await blockGenerator.loadBlockImage(this.config.image.block)
    }
    if (this.config.image.type === "autoblock") {
      blockImage = await blockGenerator.generateBlockImageFromDiff(
          this.config.image.foreground,
          this.config.image.background
      )
    }
    if (!blockImage) {
      alert("画像が不正です")
      return;
    }
    const blocks = await blockGenerator.generateFromBlockImage(
      blockImage,
      this.config.block.splitX,
      this.config.block.splitY
    );

    if (blocks.length > 0) {
      const ballRadius = Math.min(blocks[0].width, blocks[0].height) / 3
      const ballConfig = {
        radius: ballRadius,
        speed: ballRadius / 2
      }
      const paddleConfig = {
        width: ballRadius * 16,
        height: ballRadius * 1.5,
        smashWidth: ballRadius * 2.5
      }
      const itemConfig = {
        width: ballRadius * 5,
        height: ballRadius * 5,
        speed: ballRadius / 4
      }
      this.config.item = {
        ...itemConfig,
        ...this.config.item
      };
      this.config.ball = {
        ...ballConfig,
        ...this.config.ball
      };
      this.config.paddle = {
        ...paddleConfig,
        ...this.config.paddle
      };
    }

    this.game = new Breakout(
      new Renderer(this.app),
      new Player(this.config.player),
      new Stage(
        this.app.view.width / this.app.renderer.resolution,
        this.app.view.height / this.app.renderer.resolution,
        this.config.clear.achievement
      ),
      blocks,
      new Paddle(this.config.paddle),
      new BallFactory(this.config.ball),
      new ItemFactory(this.config.item)
    );

    this.game.on("onPlayerUpdate", (player: Player) => {
      this.emitter.emit("onPlayerUpdate", player);
    });
    this.game.on("onBlockCollision", (block: Block) => {
      sheet.updateBrokenBlockMask(block.x, block.y, block.width, block.height);
    });
    this.game.on("onItemGet", (item: Item) => {
      this.emitter.emit("onItemGet", item);
    });
    this.game.on(
      "onScoreChange",
      (args: [currentBlocks: number, totalBlocks: number]) => {
        const [currentBlocks, totalBlocks] = args;
        const goal = Math.ceil(
          (totalBlocks * this.config.clear.achievement) / 100
        );
        this.emitter.emit("onScoreChange", [totalBlocks - currentBlocks, goal]);
      }
    );
    this.game.on("onGameOver", () => {
      this.emitter.emit("onGameOver");
    });
    this.game.on("onClear", () => {
      this.emitter.emit("onClear");
      sheet.fillBrokenBlockMask();
    });

    const keyboard = new Keyboard(this.app.ticker);
    keyboard.init();

    this.app.renderer.plugins.interaction.on(
        "pointermove",
        (event: PIXI.InteractionEvent) => {
          this.game.movePaddle(event.data.global.x);
          this.game.moveBall(event.data.global.x);
        }
    );
    this.app.renderer.plugins.interaction.on(
        "pointerup",
        (event: PIXI.InteractionEvent) => {
          this.game.toPlaying();
        }
    );

    keyboard.on("leftkeydown", () => {
      this.game.movePaddleLeft();
    });

    keyboard.on("rightkeydown", () => {
      this.game.movePaddleRight();
    });

    keyboard.on("debugkeydown", () => {
      this.game.toggleDebugMode();
    });

    keyboard.on("spacekeydown", () => {
      this.game.toPlaying();
    });

    this.game.toWaiting();
    this.app.ticker.add(this.onTick);
  }

  onTick = (delta: number) => {
    this.game?.tick(delta);
  }

  public dispose() {
    for (let i = this.app.stage.children.length - 1; i >= 0; i--) {
      this.app.stage.removeChild(this.app.stage.children[i]);
    }
    this.app.ticker.remove(this.onTick);
    this.game.dispose();
    sound.removeAll();
  }
}
