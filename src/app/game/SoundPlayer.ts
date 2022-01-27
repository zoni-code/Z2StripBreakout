import { sound } from "@pixi/sound";

let init = false;

export class SoundPlayer {
  constructor() {
    if (init) {
      return;
    }
    sound.add("hit", require("./sound/hit.mp3"));
    sound.add("conflict", require("./sound/conflict.mp3"));
    sound.add("wall", require("./sound/wall.mp3"));
    sound.add("throwBall", require("./sound/throwBall.mp3"));
    sound.add("clear", require("./sound/clear.mp3"));
    sound.add("smash", require("./sound/smash.mp3"));
    sound.add("item", require("./sound/item.mp3"));
    sound.add("lifeDecreased", require("./sound/lifeDecreased.mp3"));
    init = true;
  }

  public play(id: string) {
    sound.play(id);
  }
}
