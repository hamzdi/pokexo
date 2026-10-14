/**
 * Turn a Pokémon sprite into a black-and-white colouring outline, in the
 * browser, with a canvas: upscale, grey, blur, Sobel edges, threshold, thicken.
 */

const SIZE = 1024;
const EDGE_THRESHOLD = 36;
const THICKEN_PASSES = 2;
const LOAD_TIMEOUT_MS = 4000;

function loadImage(src: string, crossOrigin: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => reject(new Error('timeout')), LOAD_TIMEOUT_MS);
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error('load error'));
    };
    img.src = src;
  });
}

/** 3x3 box blur on a grey buffer. */
function blur(src: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(src.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const yy = y + dy;
          const xx = x + dx;
          if (yy < 0 || yy >= h || xx < 0 || xx >= w) continue;
          sum += src[yy * w + xx] as number;
          n++;
        }
      }
      out[y * w + x] = sum / n;
    }
  }
  return out;
}

/** Sobel gradient magnitude. */
function sobel(grey: Float32Array, w: number, h: number): Float32Array {
  const out = new Float32Array(grey.length);
  const g = (x: number, y: number): number => grey[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))] as number;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gx = -g(x - 1, y - 1) - 2 * g(x - 1, y) - g(x - 1, y + 1) + g(x + 1, y - 1) + 2 * g(x + 1, y) + g(x + 1, y + 1);
      const gy = -g(x - 1, y - 1) - 2 * g(x, y - 1) - g(x + 1, y - 1) + g(x - 1, y + 1) + 2 * g(x, y + 1) + g(x + 1, y + 1);
      out[y * w + x] = Math.hypot(gx, gy);
    }
  }
  return out;
}

function dilate(mask: Uint8Array, w: number, h: number): Uint8Array {
  const out = new Uint8Array(mask.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let on = 0;
      for (let dy = -1; dy <= 1 && !on; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const yy = y + dy;
          const xx = x + dx;
          if (yy < 0 || yy >= h || xx < 0 || xx >= w) continue;
          if (mask[yy * w + xx]) {
            on = 1;
            break;
          }
        }
      }
      out[y * w + x] = on;
    }
  }
  return out;
}

/**
 * Build the outline as a PNG data URL. Tries the full-resolution source first
 * (needs CORS), then falls back to the embedded sprite.
 */
export async function buildOutline(sources: { fullRes: string; embedded: string }): Promise<string> {
  let img: HTMLImageElement;
  try {
    img = await loadImage(sources.fullRes, true);
  } catch {
    img = await loadImage(sources.embedded, false);
  }
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas not supported');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const margin = SIZE * 0.06;
  ctx.drawImage(img, margin, margin, SIZE - 2 * margin, SIZE - 2 * margin);

  const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
  let grey: Float32Array<ArrayBufferLike> = new Float32Array(SIZE * SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    grey[i] = 0.299 * (data[i * 4] as number) + 0.587 * (data[i * 4 + 1] as number) + 0.114 * (data[i * 4 + 2] as number);
  }
  grey = blur(blur(grey, SIZE, SIZE), SIZE, SIZE);
  const edges = sobel(grey, SIZE, SIZE);
  let mask: Uint8Array<ArrayBufferLike> = new Uint8Array(SIZE * SIZE);
  for (let i = 0; i < mask.length; i++) mask[i] = (edges[i] as number) > EDGE_THRESHOLD ? 1 : 0;
  for (let pass = 0; pass < THICKEN_PASSES; pass++) mask = dilate(mask, SIZE, SIZE);

  const out = ctx.createImageData(SIZE, SIZE);
  for (let i = 0; i < mask.length; i++) {
    const v = mask[i] ? 20 : 255;
    out.data[i * 4] = v;
    out.data[i * 4 + 1] = v;
    out.data[i * 4 + 2] = v;
    out.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);
  return canvas.toDataURL('image/png');
}
