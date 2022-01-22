import { Block } from "./gameObject/Block";

export class BlockGenerator {
  constructor() {}

  public async loadBlockImage(block: string) {
    return this.loadImage(block);
  }

  public async generateBlockImageFromDiff(
    foreground: string,
    background: string
  ): Promise<HTMLCanvasElement | null> {
    const foregroundImage = await this.loadImage(foreground);
    const backgroundImage = await this.loadImage(background);
    const foregroundImageData = this.getImageData(foregroundImage)?.data;
    const backgroundImageData = this.getImageData(backgroundImage)?.data;

    if (!foregroundImageData || !backgroundImageData) {
      return null;
    }

    const blockImageData = new Uint8ClampedArray(foregroundImageData.length);

    for (let i = 0; i < foregroundImageData.length; i += 4) {
      const isSame =
        foregroundImageData[i] - backgroundImageData[i] === 0 &&
        foregroundImageData[i + 1] - backgroundImageData[i + 1] === 0 &&
        foregroundImageData[i + 2] - backgroundImageData[i + 2] === 0 &&
        foregroundImageData[i + 3] - backgroundImageData[i + 3] === 0;
      if (!isSame) {
        blockImageData[i + 3] = 255;
      } else {
        blockImageData[i + 3] = 0;
      }
    }

    return this.imageBufferToCanvas(
      blockImageData,
      foregroundImage.width,
      foregroundImage.height
    );
  }

  public async generateFromBlockImage(
    blockImage: HTMLImageElement | HTMLCanvasElement,
    splitX: number,
    splitY: number
  ) {
    const blockImageCanvas = document.createElement("canvas");
    blockImageCanvas.width = blockImage.width;
    blockImageCanvas.height = blockImage.height;
    const context = blockImageCanvas.getContext("2d");
    if (!context) {
      return [];
    }
    context.drawImage(blockImage, 0, 0);

    const unitX = blockImage.width / splitX;
    const unitY = blockImage.height / splitY;
    const dilationImageData = new Uint8ClampedArray(splitX * splitY * 4);
    for (let i = 0; i < splitY; i++) {
      for (let j = 0; j < splitX; j++) {
        const data = context.getImageData(
          j * unitX,
          i * unitY,
          unitX,
          unitY
        ).data;
        const index = (i * splitX + j) * 4;
        dilationImageData[index + 3] = this.hasNoneTransparentPixel(data)
          ? 1
          : 0;
      }
    }

    const blocks: Block[] = [];
    const blockWidth = blockImage.width / 2 / splitX;
    const blockHeight = blockImage.height / 2 / splitY;
    for (let i = 0; i < dilationImageData.length; i += 4) {
      if (dilationImageData[i + 3] !== 0) {
        // 不透明なところにブロック生成
        blocks.push(
          new Block(
            i,
            ((i / 4) % splitX) * blockWidth,
            Math.floor(i / 4 / splitX) * blockHeight,
            blockWidth,
            blockHeight
          )
        );
      }
    }
    return blocks;
  }

  private hasNoneTransparentPixel(buffer: Uint8ClampedArray) {
    for (let i = 0; i < buffer.length; i += 4) {
      if (buffer[i + 3] !== 0) {
        return true;
      }
    }
    return false;
  }

  private loadImage(path: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const foregroundImage = new Image();
      foregroundImage.src = path;
      foregroundImage.onload = () => {
        resolve(foregroundImage);
      };
      foregroundImage.onabort = () => {
        reject();
      };
    });
  }

  private getImageData(image: HTMLImageElement): ImageData | null {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }
    context.drawImage(image, 0, 0);
    return context.getImageData(0, 0, image.width, image.height);
  }

  private imageBufferToCanvas(
    buffer: Uint8ClampedArray,
    width: number,
    height: number
  ) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }
    canvas.width = width;
    canvas.height = height;
    const imageData = context.createImageData(width, height);
    imageData.data.set(buffer);
    context.putImageData(imageData, 0, 0);
    return canvas;
  }
}
