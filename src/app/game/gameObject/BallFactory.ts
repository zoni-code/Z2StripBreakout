import { BallConfig } from "../Config";
import { Ball } from "./Ball";

export class BallFactory {
  constructor(private ballConfig: BallConfig) {}

  public getBall() {
    return new Ball(this.ballConfig);
  }
}
