import { Block } from "./gameObject/Block";

export class BlockGenerator {
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
}
