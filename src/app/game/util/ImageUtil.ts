export function getImageData(image: HTMLImageElement): ImageData | null {
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

export function loadImage(path: string): Promise<HTMLImageElement> {
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

export async function getDiffImage(foreground: string, background: string) {
  const foregroundImage = await loadImage(foreground);
  const backgroundImage = await loadImage(background);
  const foregroundImageData = getImageData(foregroundImage)?.data;
  const backgroundImageData = getImageData(backgroundImage)?.data;

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

  return imageBufferToCanvas(
    blockImageData,
    foregroundImage.width,
    foregroundImage.height
  );
}

function imageBufferToCanvas(
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
