import * as PIXI from "pixi.js";
import { Config } from "../game/Config";
import { StripBreakout } from "../game/StripBreakout";
import { Modal } from "./Modal";
import { Player } from "../game/gameObject/Player";
import {
  CursorBall,
  FastBall,
  Item,
  ShortPaddle,
  WallItem,
  WidePaddle,
} from "../game/gameObject/Item";

export class Z2StriptBreakout {
  private app: PIXI.Application;
  private index = 0;
  private canvas: Element;
  private lifeValue: HTMLElement;
  private clearValue: HTMLElement;
  private modal: Modal;
  private game: StripBreakout;

  constructor(private container: HTMLElement, private config: Config) {
    this.container.innerHTML = this.createHtml();
    this.canvas = this.container.querySelector("#stbo-canvas")!;
    this.app = this.createApp();
    this.lifeValue = this.container.querySelector("#stbo-status #life-value")!;
    this.clearValue = this.container.querySelector(
      "#stbo-status #clear-value"
    )!;
    this.modal = new Modal(document.getElementById("stbo-modals")!);
  }

  public start() {
    this.runStage(this.index);
  }

  public destroy() {
    this.app?.destroy();
  }

  private runStage(index: number) {
    this.game?.dispose();
    this.game = new StripBreakout(this.app, this.config.stages[index]);
    this.game.on("onPlayerUpdate", (player: Player) => {
      this.lifeValue.textContent = player.life.toString();
    });
    this.game.on(
      "onScoreChange",
      (args: [currentBlocks: number, totalBlocks: number]) => {
        const [currentBlocks, totalBlocks] = args;
        this.clearValue.textContent = `${currentBlocks} / ${totalBlocks}`;
      }
    );
    this.game.on("onItemGet", (item: Item) => {
      // 正確なゲージが表示できないので透明度でお茶を濁す
      if (item instanceof WallItem) {
        const status = document.querySelector<HTMLElement>(".stbo-status-wall");
        this.doOpacityAnimation(status, item.duration);
        return;
      }
      if (item instanceof CursorBall) {
        const status = document.querySelector<HTMLElement>(
          ".stbo-status-cursor"
        );
        this.doOpacityAnimation(status, item.duration);
        return;
      }
      if (item instanceof WidePaddle) {
        const status = document.querySelector<HTMLElement>(
          ".stbo-status-paddle"
        );
        this.doOpacityAnimation(status, item.duration);
        return;
      }
      if (item instanceof ShortPaddle) {
        const status = document.querySelector<HTMLElement>(
          ".stbo-status-paddle"
        );
        this.doOpacityAnimation(status, item.duration);
        return;
      }
      if (item instanceof FastBall) {
        const status = document.querySelector<HTMLElement>(".stbo-status-fast");
        this.doOpacityAnimation(status, item.duration);
        return;
      }
    });
    this.game.on("onClear", () => {
      this.resetAllStatus();
      if (this.config.stages[index + 1]) {
        this.modal.show({
          title: "クリアしました",
          downloadLink: {
            label: "画像をダウンロード",
            url: this.config.stages[index].image.background,
          },
          primaryButton: {
            label: "次へ",
            onClick: () => {
              this.runStage(++this.index);
            },
          },
        });
      } else {
        this.modal.show({
          title: "すべてのステージをクリアしました",
          downloadLink: {
            label: "画像をダウンロード",
            url: this.config.stages[index].image.background,
          },
        });
      }
    });
    this.game.on("onGameOver", () => {
      this.modal.show({
        title: "残念でした",
        primaryButton: {
          label: "再挑戦",
          onClick: () => {
            this.runStage(this.index);
          },
        },
      });
    });
    this.game.start();
  }

  private doOpacityAnimation(status: HTMLElement | null, duration: number) {
    if (!status) {
      return;
    }
    status.style.opacity = "1";
    status.style.transitionDuration = "0s";
    window.setTimeout(() => {
      status.style.opacity = "0";
      status.style.transitionDuration = duration + "s";
    }, 0);
  }

  private resetAllStatus() {
    document.querySelectorAll<HTMLElement>(".stbo-status").forEach((status) => {
      status.style.opacity = "";
      status.style.transitionDuration = "";
    });
  }

  private createHtml() {
    return `
            <div id="stbo-canvas"></div>
                <div id="stbo-status" class="stbo-status-bar">
                    <span class="stbo-status">
                        <span class="stbo-status-label">LIFE</span>
                        <span id="life-value" class="stbo-status-value">0</span>
                    </span>
                    <span class="stbo-status stbo-status-cursor">
                        <span class="stbo-status-label">CURSOR</span>
                    </span>
                    <span class="stbo-status stbo-status-wall">
                        <span class="stbo-status-label">WALL</span>
                    </span>
                    <span class="stbo-status stbo-status-paddle">
                        <span class="stbo-status-label">PADDLE</span>
                    </span>
                    <span class="stbo-status stbo-status-fast">
                        <span class="stbo-status-label">SPEED</span>
                    </span>
                    <span class="stbo-status stbo-status-clear">
                        <span class="stbo-status-label">クリアまで</span>
                        <span id="clear-value" class="stbo-status-value">0</span>
                    </span>
                </div>
            <div id="stbo-modals"></div>
        `;
  }

  private createApp() {
    const app = new PIXI.Application({
      resolution: window.devicePixelRatio || 1,
    });
    this.canvas.appendChild(app.view);
    return app;
  }
}
