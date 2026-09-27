const MAX_EDGE = 1600;
const TOLERANCE = 42;

const MIN_BOOK_FRACTION = 0.05;

export interface CornerPoint {
  x: number;
  y: number;
}

export interface UniformBackgroundResult {
  dataUrl: string;

  corners: CornerPoint[] | null;
}

export function detectBookCorners(
  background: Uint8Array,
  w: number,
  h: number,
): CornerPoint[] | null {
  const total = w * h;
  const seen = new Uint8Array(total);
  const stack = new Int32Array(total);

  let bestSize = 0;
  let best: { tl: number; tr: number; br: number; bl: number } | null = null;

  for (let start = 0; start < total; start++) {
    if (background[start] || seen[start]) continue;

    
    let sp = 0;
    seen[start] = 1;
    stack[sp++] = start;

    let size = 0;
    let tl = start;
    let br = start;
    let tr = start;
    let bl = start;
    let minS = Infinity;
    let maxS = -Infinity;
    let minD = Infinity;
    let maxD = -Infinity;

    while (sp > 0) {
      const p = stack[--sp];
      size++;
      const x = p % w;
      const y = (p / w) | 0;
      const s = x + y;
      const dd = x - y;
      if (s < minS) { minS = s; tl = p; }
      if (s > maxS) { maxS = s; br = p; }
      if (dd > maxD) { maxD = dd; tr = p; }
      if (dd < minD) { minD = dd; bl = p; }

      if (x > 0) { const n = p - 1; if (!background[n] && !seen[n]) { seen[n] = 1; stack[sp++] = n; } }
      if (x < w - 1) { const n = p + 1; if (!background[n] && !seen[n]) { seen[n] = 1; stack[sp++] = n; } }
      if (y > 0) { const n = p - w; if (!background[n] && !seen[n]) { seen[n] = 1; stack[sp++] = n; } }
      if (y < h - 1) { const n = p + w; if (!background[n] && !seen[n]) { seen[n] = 1; stack[sp++] = n; } }
    }

    if (size > bestSize) {
      bestSize = size;
      best = { tl, tr, br, bl };
    }
  }

  if (!best || bestSize / total < MIN_BOOK_FRACTION) return null;

  const toPoint = (p: number): CornerPoint => ({
    x: ((p % w) + 0.5) / w,
    y: (((p / w) | 0) + 0.5) / h,
  });

  return [toPoint(best.tl), toPoint(best.tr), toPoint(best.br), toPoint(best.bl)];
}

export function removeUniformBackground(
  img: HTMLImageElement,
): UniformBackgroundResult | null {
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h); 
  const d = imageData.data;

 
  const border: number[] = [];
  for (let x = 0; x < w; x++) {
    border.push(x, (h - 1) * w + x);
  }
  for (let y = 1; y < h - 1; y++) {
    border.push(y * w, y * w + (w - 1));
  }

  
  const median = (c: number) => {
    const vals = border.map((p) => d[p * 4 + c]).sort((a, b) => a - b);
    return vals[Math.floor(vals.length / 2)];
  };
  const bg = [median(0), median(1), median(2)];
  const tol2 = TOLERANCE * TOLERANCE;
  const near = (p: number) => {
    const i = p * 4;
    const dr = d[i] - bg[0];
    const dg = d[i + 1] - bg[1];
    const db = d[i + 2] - bg[2];
    return dr * dr + dg * dg + db * db <= tol2;
  };

  
  const uniform = border.filter(near).length / border.length;
  if (uniform < 0.6) return null;

  const visited = new Uint8Array(w * h);
  const stack = new Int32Array(w * h);
  let sp = 0;
  const push = (p: number) => {
    if (!visited[p] && near(p)) {
      visited[p] = 1;
      stack[sp++] = p;
    }
  };
  border.forEach(push);

  let removed = 0;
  while (sp > 0) {
    const p = stack[--sp];
    d[p * 4 + 3] = 0;
    removed++;
    const x = p % w;
    const y = (p / w) | 0;
    if (x > 0) push(p - 1);
    if (x < w - 1) push(p + 1);
    if (y > 0) push(p - w);
    if (y < h - 1) push(p + w);
  }

  
  const fraction = removed / (w * h);
  if (fraction < 0.02 || fraction > 0.9) return null;

  const corners = detectBookCorners(visited, w, h);

  ctx.putImageData(imageData, 0, 0);
  return { dataUrl: canvas.toDataURL('image/png'), corners };
}