import { ItemConfig } from "../Config";
import { CursorBall, FastBall, Item, MultiBall, ShortPaddle, WallItem, WidePaddle } from "./Item";

export class ItemFactory {
  constructor(private itemConfig: ItemConfig) {}

  public getItem(): Item | null {
    if (Math.random() > this.itemConfig.rate / 100) {
      return null;
    }
    const rand = Math.random();
    if (rand < 0.35) {
      return new ShortPaddle(this.itemConfig.shortPaddle, this.itemConfig);
    } else if (rand < 0.45) {
      return new FastBall(this.itemConfig.fastBall, this.itemConfig);
    } else if (rand < 0.65) {
      return new WidePaddle(this.itemConfig.widePaddle, this.itemConfig);
    } else if (rand < 0.80) {
      return new MultiBall(this.itemConfig.multiBall, this.itemConfig);
    } else if (rand < 0.90) {
      return new CursorBall(this.itemConfig.cursorBall, this.itemConfig);
    } else {
      return new WallItem(this.itemConfig.wallItem, this.itemConfig);
    }
  }
}
