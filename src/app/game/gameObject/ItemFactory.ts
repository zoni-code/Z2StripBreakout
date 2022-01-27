import { ItemConfig, ItemRateConfig } from "../Config";
import {
  CursorBall,
  FastBall,
  Item,
  MultiBall,
  ShortPaddle,
  WallItem,
  WidePaddle,
} from "./Item";

export class ItemFactory {
  private randomGetter: ItemRandomGetter;

  constructor(private itemConfig: ItemConfig) {
    this.randomGetter = new ItemRandomGetter(itemConfig.rateConfig);
  }

  public getItem(): Item | null {
    if (Math.random() > this.itemConfig.rate / 100) {
      return null;
    }
    const itemName = this.randomGetter.get();
    switch (itemName) {
      case "multiBall":
        return new MultiBall(this.itemConfig.multiBall, this.itemConfig);
      case "cursorBall":
        return new CursorBall(this.itemConfig.cursorBall, this.itemConfig);
      case "wallItem":
        return new WallItem(this.itemConfig.wallItem, this.itemConfig);
      case "widePaddle":
        return new WidePaddle(this.itemConfig.widePaddle, this.itemConfig);
      case "shortPaddle":
        return new ShortPaddle(this.itemConfig.shortPaddle, this.itemConfig);
      case "fastBall":
        return new FastBall(this.itemConfig.fastBall, this.itemConfig);
    }
    return null;
  }
}

class ItemRandomGetter {
  private total: number = 0;
  private itemRateConfig: { [key: string]: number } = {};

  constructor(itemRateConfig: ItemRateConfig) {
    Object.keys(itemRateConfig).map((key) => {
      const itemName = key as keyof ItemRateConfig;
      this.total += itemRateConfig[itemName];
      this.itemRateConfig[itemName] = this.total;
    });
  }

  get(rand: number = Math.random()) {
    const index = rand * this.total;
    for (const [key, value] of Object.entries(this.itemRateConfig)) {
      if (value > index) {
        return key;
      }
    }
    return null;
  }
}
