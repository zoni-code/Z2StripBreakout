import * as PIXI from "pixi.js";
import { EventEmitter } from "./util/EventEmitter";

type KeyboardEvent = {
  leftkeydown: void;
  rightkeydown: void;
  spacekeydown: void;
  debugkeydown: void;
};
export class Keyboard extends EventEmitter<KeyboardEvent> {
  private leftPressed: boolean = false;

  private rightPressed: boolean = false;

  constructor(private ticker: PIXI.Ticker) {
    super();
  }

  public init() {
    this.ticker.add(() => {
      if (this.leftPressed) {
        this.emitter.emit("leftkeydown");
      }
      if (this.rightPressed) {
        this.emitter.emit("rightkeydown");
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Right" || event.key === "ArrowRight") {
        this.rightPressed = true;
      } else if (event.key === "Left" || event.key === "ArrowLeft") {
        this.leftPressed = true;
      }
      if (event.key === " ") {
        this.emitter.emit("spacekeydown");
      }
      if (event.key === "d") {
        this.emitter.emit("debugkeydown");
      }
    });
    document.addEventListener("keyup", (event) => {
      if (event.key === "Right" || event.key === "ArrowRight") {
        this.rightPressed = false;
      } else if (event.key === "Left" || event.key === "ArrowLeft") {
        this.leftPressed = false;
      }
    });
  }
}
