import { ImageConfig, ImageType } from "../../app/game/Config";

export class StageConfigForm {
  public init() {
    const typeInputs =
      document.querySelectorAll<HTMLInputElement>("input[name=type]");
    typeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        this.syncStageForm();
      });
    });
    this.syncStageForm();
  }

  private syncStageForm() {
    const checkedTypeInput = document.querySelector<HTMLInputElement>(
      "input[name=type]:checked"
    )!;
    const hideBlockImageInput = checkedTypeInput.value !== "blockimage";
    const blockImageForm = document.querySelectorAll<HTMLElement>(
      ".stbo-generator-page-form-stage-block"
    );
    blockImageForm.forEach((form) => {
      form.hidden = hideBlockImageInput;
      form.querySelector("input")!.disabled = hideBlockImageInput;
    });
  }

  public addStage() {
    const stageForms = document.querySelector(
      ".stbo-generator-page-form-stages"
    );
    if (stageForms) {
      const div = document.createElement("div");
      div.innerHTML = this.createStageForm();
      const stage = div.firstElementChild;
      if (stage) {
        const deleteButton = stage.querySelector(
          ".stbo-generator-page-form-stage-delete"
        );
        deleteButton?.addEventListener("click", () => {
          this.deleteStage(stage);
        });
        stageForms.appendChild(stage);
      }
    }
    this.syncStageForm();
  }

  public deleteStage(stage: Element) {
    const stageForms = document.querySelector(
      ".stbo-generator-page-form-stages"
    );
    stageForms?.removeChild(stage);
  }

  public async getImageConfig() {
    const stages = Array.from(
      document.querySelectorAll(".stbo-generator-page-form-stage")
    );
    const stageConfigs: ImageConfig[] = [];
    for (const stage of stages) {
      const foreground = stage.querySelector<HTMLInputElement>(
        'input[name="foreground"]'
      );
      const background = stage.querySelector<HTMLInputElement>(
        'input[name="background"]'
      );
      const block = stage.querySelector<HTMLInputElement>(
        'input[name="block"]'
      );
      const checkedTypeInput = document.querySelector<HTMLInputElement>(
        "input[name=type]:checked"
      )!;
      if (
        foreground &&
        foreground.files &&
        foreground.files.length > 0 &&
        background &&
        background.files &&
        background.files.length > 0
      ) {
        const foregroundDataUrl = await this.loadFileAsDataUrl(
          foreground.files[0]
        );
        const backgroundDataUrl = await this.loadFileAsDataUrl(
          background.files[0]
        );
        const blockDataUrl =
          block && !block.disabled && block.files
            ? await this.loadFileAsDataUrl(block.files[0])
            : undefined;
        stageConfigs.push({
          type: checkedTypeInput.value as ImageType,
          foreground: foregroundDataUrl,
          background: backgroundDataUrl,
          block: blockDataUrl,
        });
      }
    }
    return stageConfigs;
  }

  private createStageForm() {
    return `
    <div class="stbo-generator-page-form-stage">
      <div>
        <label class="stbo-generator-page-form-stage-label"
          >前景画像</label
        >
        <div class="stbo-generator-page-form-stage-drop-zone">
          <input type="file" name="foreground" accept=".png" required/>
        </div>
      </div>
      <div>
        <label class="stbo-generator-page-form-stage-label"
          >背景画像</label
        >
        <div class="stbo-generator-page-form-stage-drop-zone">
          <input type="file" name="background" accept=".png" required/>
        </div>
      </div>
      <div class="stbo-generator-page-form-stage-block">
        <label class="stbo-generator-page-form-stage-label"
          >ブロック画像</label
        >
        <div class="stbo-generator-page-form-stage-drop-zone">
          <input type="file" name="block" accept=".png" required/>
        </div>
      </div>
      <button type="button" class="stbo-generator-page-form-stage-delete" aria-label="ステージ削除">✕</button>
    </div>
    `;
  }

  private loadFileAsDataUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        if (event.target) {
          resolve(event.target.result as string);
        }
      };
      fileReader.onerror = () => {
        reject();
      };
      fileReader.readAsDataURL(file);
    });
  }
}
