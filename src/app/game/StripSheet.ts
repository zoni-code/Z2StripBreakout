import { Application } from "pixi.js";
import { ImageConfig } from "./Config";
import * as PIXI from "pixi.js";

// 同じ名前で読み込んだ時のエラーを避ける
let index = 0;

export class StripSheet {
  private foregroundImage: PIXI.Sprite;
  private backgroundImage: PIXI.Sprite;
  private maskTexture: PIXI.RenderTexture;
  private mask: PIXI.Graphics;

  constructor(private app: Application, private config: ImageConfig) {
    this.mask = new PIXI.Graphics();
  }

  public updateBrokenBlockMask(
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.mask.beginFill(0x000000);
    this.mask.drawRect(x, y, width, height);
    this.mask.endFill();
    this.app.renderer.render(this.mask, { renderTexture: this.maskTexture });
  }

  public fillBrokenBlockMask() {
    this.mask.beginFill(0x000000);
    this.mask.drawRect(
      0,
      0,
      this.foregroundImage.width,
      this.foregroundImage.height
    );
    this.mask.endFill();
    this.app.renderer.render(this.mask, { renderTexture: this.maskTexture });
  }

  public init() {
    return new Promise((resolve, reject) => {
      this.app.loader
        .add("foreground" + index, this.config.foreground)
        .add("background" + index, this.config.background)
        .load((resources) => {
          this.foregroundImage = PIXI.Sprite.from("foreground" + index);
          this.backgroundImage = PIXI.Sprite.from("background" + index);
          this.app.renderer.resize(
            this.foregroundImage.width / 2,
            this.foregroundImage.height / 2
          );
          this.maskTexture = PIXI.RenderTexture.create({
            width: this.foregroundImage.width,
            height: this.foregroundImage.height,
          });
          this.foregroundImage.mask = new PIXI.Sprite(this.maskTexture);
          this.foregroundImage.roundPixels = true;
          this.backgroundImage.roundPixels = true;
          this.foregroundImage.scale.x = 0.5;
          this.foregroundImage.scale.y = 0.5;
          this.backgroundImage.scale.x = 0.5;
          this.backgroundImage.scale.y = 0.5;
          this.app.stage.addChild(this.backgroundImage);
          this.app.stage.addChild(this.foregroundImage);
          this.mask = new PIXI.Graphics();
          this.mask.beginFill(0xff0000);
          this.mask.drawRect(
            0,
            0,
            this.foregroundImage.width,
            this.foregroundImage.height
          );
          this.mask.endFill();
          this.app.renderer.render(this.mask, {
            renderTexture: this.maskTexture,
          });
          index++;
          resolve(true);
        });
    });
  }
}
