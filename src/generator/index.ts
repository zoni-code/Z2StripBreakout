import "./assets/style.css";
import { Downloader } from "./lib/Downloader";
import { StageConfigForm } from "./lib/StageConfigForm";
import { ImageConfig } from "../app/game/Config";
import { GameConfig, GameConfigForm } from "./lib/GameConfigForm";

declare const VERSION: string;

window.addEventListener("DOMContentLoaded", () => {
  const versionLabel = document.querySelector(
    ".stbo-generator-page-title-version"
  );
  if (versionLabel) {
    versionLabel.textContent = "version " + VERSION;
  }

  const stageConfigForm = new StageConfigForm();
  const gameConfigForm = new GameConfigForm();

  const addStageButton = document.querySelector(
    ".stbo-generator-page-form-stage-add"
  );
  addStageButton?.addEventListener("click", () => {
    stageConfigForm.addStage();
  });

  const previewButton = document.getElementById("preview-button");
  previewButton?.addEventListener("click", async (event) => {
    if (!isFormValid()) {
      alert("画像もしくはオプションが指定されていません");
      return;
    }
    const imageConfig = await stageConfigForm.getImageConfig();
    const gameConfig = gameConfigForm.getGameConfig();
    updatePreview(imageConfig, gameConfig);
  });

  const downloadButton = document.getElementById("download-button");
  downloadButton?.addEventListener("click", async () => {
    if (!isFormValid()) {
      alert("画像もしくはオプションが指定されていません");
      return;
    }
    const imageConfig = await stageConfigForm.getImageConfig();
    const gameConfig = gameConfigForm.getGameConfig();
    await new Downloader().downloadAsZip(imageConfig, gameConfig);
  });

  const formatDetailLink = document.getElementById("format-detail");
  formatDetailLink?.addEventListener("click", () => {
    const modal = document.querySelector<HTMLElement>(
      ".stbo-generator-page-modals"
    );
    if (modal) {
      modal.hidden = false;
    }
  });

  const modalBackdrop = document.querySelector(".stbo-generator-page-backdrop");
  modalBackdrop?.addEventListener("click", (event) => {
    if (event.target !== modalBackdrop) {
      return;
    }
    const modal = document.querySelector<HTMLElement>(
      ".stbo-generator-page-modals"
    );
    if (modal) {
      modal.hidden = true;
    }
  });

  stageConfigForm.addStage();
  stageConfigForm.init();

  function isFormValid() {
    return document
      .querySelector<HTMLFormElement>(".stbo-generator-page-form")
      ?.checkValidity();
  }

  function updatePreview(imageConfig: ImageConfig[], gameConfig: GameConfig) {
    const global = window as any;
    global.instance?.destroy();
    global.instance = global.StripBreakout(
      document.getElementById("stbo-app"),
      (isMobileOs: boolean) => {
        const stageConfig = imageConfig.map((config) => {
          return {
            image: config,
            block: {
              splitX: isMobileOs ? gameConfig.spSplit : gameConfig.pcSplit,
              splitY: isMobileOs ? gameConfig.spSplit : gameConfig.pcSplit,
            },
            clear: {
              achievement: gameConfig.achievement,
            },
            player: {
              life: gameConfig.life,
            },
          };
        });
        return {
          stages: stageConfig,
        };
      }
    );
  }
});
