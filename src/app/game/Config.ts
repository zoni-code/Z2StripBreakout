import { PartialDeep } from "type-fest";
import { FastBall } from "./gameObject/Item";

export type ImageType = "foregroundasblock" | "blockimage" | "autoblock";

export type ImageConfig = {
  type: ImageType;
  background: string;
  foreground: string;
  block?: string;
};

export type PaddleConfig = {
  width: number;
  height: number;
  smashWidth: number;
};

export type BallConfig = {
  radius: number;
  speed: number;
};

export type ClearConfig = {
  achievement: number;
};

export type BlockConfig = {
  splitX: number;
  splitY: number;
};

export type MultiBallConfig = {
  balls: number;
};

export type CursorBallConfig = {
  duration: number;
};

export type WallItemConfig = {
  duration: number;
};

export type WidePaddleConfig = {
  duration: number;
};

export type ShortPaddleConfig = {
  duration: number;
};

export type FastBallConfig = {
  duration: number;
};

export type ItemConfig = {
  rate: number;
  rateConfig: ItemRateConfig,
  width: number;
  height: number;
  speed: number;
  multiBall: MultiBallConfig;
  cursorBall: CursorBallConfig;
  wallItem: WallItemConfig;
  widePaddle: WidePaddleConfig;
  shortPaddle: ShortPaddleConfig;
  fastBall: FastBallConfig;
};

export type ItemRateConfig = Record<
    "multiBall" |
    "cursorBall" |
    "wallItem" |
    "widePaddle" |
    "shortPaddle" |
    "fastBall"
    , number>

export type StageConfig = {
  image: ImageConfig;
  ball: BallConfig;
  block: BlockConfig;
  paddle: PaddleConfig;
  item: ItemConfig;
  clear: ClearConfig;
  player: PlayerConfig;
};

export type PlayerConfig = {
  life: number;
};

export type Config = {
  stages: StageConfig[];
};

export const defaultStageConfig: PartialDeep<StageConfig> = {
  player: {
    life: 10,
  },
  block: {
    splitX: 32,
    splitY: 32,
  },
  item: {
    rate: 5,
    rateConfig: {
      multiBall: 10,
      cursorBall: 20,
      wallItem: 10,
      widePaddle: 10,
      shortPaddle: 30,
      fastBall: 10
    },
    multiBall: {
      balls: 2
    },
    cursorBall: {
      duration: 5
    },
    wallItem: {
      duration: 15
    },
    widePaddle: {
      duration: 15
    },
    shortPaddle: {
      duration: 8
    },
    fastBall: {
      duration: 15
    }
  },
  clear: {
    achievement: 70,
  },
};
