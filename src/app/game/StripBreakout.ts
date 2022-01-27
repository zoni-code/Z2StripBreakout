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
import { Block } from "./gameObject/Block";
import { BallFactory } from "./gameObject/BallFactory";
import { ItemFactory } from "./gameObject/ItemFactory";
import { Item } from "./gameObject/Item";
import { SoundPlayer } from "./SoundPlayer";
import { getDiffImage, loadImage } from "./util/ImageUtil";

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
    const sheet = new StripSheet(this.app, this.config.image);
    await sheet.init();

    let blockImage = await this.makeBlockImage(this.config);
    if (!blockImage) {
      alert("画像が不正です");
      return;
    }

    const blocks = await new BlockGenerator().generateFromBlockImage(
      blockImage,
      this.config.block.splitX,
      this.config.block.splitY
    );

    if (blocks.length > 0) {
      this.config = this.makeDefaultConfig(
        blocks[0].width,
        blocks[0].height,
        this.config
      );
    }

    this.game = new Breakout(
      new Renderer(this.app),
      new SoundPlayer(),
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
  };

  public dispose() {
    for (let i = this.app.stage.children.length - 1; i >= 0; i--) {
      this.app.stage.removeChild(this.app.stage.children[i]);
    }
    this.app.ticker.remove(this.onTick);
    this.game.dispose();
  }

  private makeBlockImage(config: StageConfig) {
    if (config.image.type === "foregroundasblock") {
      return loadImage(config.image.foreground);
    }
    if (config.image.type === "blockimage" && config.image.block) {
      return loadImage(config.image.block);
    }
    if (config.image.type === "autoblock") {
      return getDiffImage(config.image.foreground, config.image.background);
    }
  }

  private makeDefaultConfig(
    blockWidth: number,
    blockHeight: number,
    userConfig: StageConfig
  ): StageConfig {
    const defaultConfig = { ...userConfig };
    const ballRadius = Math.min(blockWidth, blockHeight) / 3;
    const ballConfig = {
      radius: ballRadius,
      speed: ballRadius / 2,
    };
    const paddleConfig = {
      width: ballRadius * 16,
      height: ballRadius * 1.5,
      smashWidth: ballRadius * 2.5,
    };
    const itemConfig = {
      width: ballRadius * 5,
      height: ballRadius * 5,
      speed: ballRadius / 4,
    };
    defaultConfig.item = {
      ...itemConfig,
      ...defaultConfig.item,
    };
    defaultConfig.ball = {
      ...ballConfig,
      ...defaultConfig.ball,
    };
    defaultConfig.paddle = {
      ...paddleConfig,
      ...defaultConfig.paddle,
    };
    return defaultConfig;
  }
}
