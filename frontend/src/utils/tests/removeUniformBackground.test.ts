import {
  detectBookCorners,
  removeUniformBackground,
} from '../removeUniformBackground'



describe('detectBookCorners', () => {
  it('returns null when every pixel is background', () => {
    const bg = new Uint8Array(100).fill(1)
    expect(detectBookCorners(bg, 10, 10)).toBeNull()
  })

  it('returns null when the largest foreground blob is below the min fraction', () => {
    const bg = new Uint8Array(100).fill(1)
    bg[55] = 0 
    expect(detectBookCorners(bg, 10, 10)).toBeNull()
  })

  it('returns corners for a foreground rectangle as (tl, tr, br, bl)', () => {
    const bg = new Uint8Array(100).fill(1)
    for (let y = 2; y <= 6; y++)
      for (let x = 2; x <= 6; x++) bg[y * 10 + x] = 0

    const corners = detectBookCorners(bg, 10, 10)!
    expect(corners).toHaveLength(4)
    const [tl, tr, br, bl] = corners
    expect(tl.x + tl.y).toBeLessThan(tr.x + tr.y)
    expect(br.x + br.y).toBeGreaterThan(bl.x + bl.y)
    expect(tr.x - tr.y).toBeGreaterThan(tl.x - tl.y)
    expect(bl.x - bl.y).toBeLessThan(br.x - br.y)
  })

  it('picks the largest foreground blob when there are several', () => {
    const bg = new Uint8Array(400).fill(1) // 20x20
    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) bg[y * 20 + x] = 0
    for (let y = 10; y < 20; y++)
      for (let x = 10; x < 20; x++) bg[y * 20 + x] = 0

    const corners = detectBookCorners(bg, 20, 20)!
    expect(corners.every((c) => c.x > 0.4 && c.y > 0.4)).toBe(true)
  })
})



type Pixel = [r: number, g: number, b: number, a: number]

const gridToImageData = (pixels: Pixel[][]) => {
  const h = pixels.length
  const w = pixels[0].length
  const data = new Uint8ClampedArray(w * h * 4)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      data[i] = pixels[y][x][0]
      data[i + 1] = pixels[y][x][1]
      data[i + 2] = pixels[y][x][2]
      data[i + 3] = pixels[y][x][3]
    }
  return { data, width: w, height: h }
}

const stubCanvas = (imageData: ReturnType<typeof gridToImageData>) => {
  const ctx = {
    drawImage: jest.fn(),
    getImageData: jest.fn(() => imageData),
    putImageData: jest.fn(),
  }
  ;(HTMLCanvasElement.prototype as any).getContext = jest.fn(() => ctx)
  ;(HTMLCanvasElement.prototype as any).toDataURL = jest.fn(
    () => 'data:image/png;base64,PROCESSED',
  )
  return ctx
}

const fakeImg = (w = 10, h = 10): HTMLImageElement =>
  ({ naturalWidth: w, naturalHeight: h }) as HTMLImageElement


const whiteBorderDarkCentre = (): Pixel[][] => {
  const px: Pixel[][] = []
  for (let y = 0; y < 8; y++) {
    const row: Pixel[] = []
    for (let x = 0; x < 8; x++) {
      row.push(
        x >= 2 && x < 6 && y >= 2 && y < 6
          ? [0, 0, 0, 255]
          : [255, 255, 255, 255],
      )
    }
    px.push(row)
  }
  return px
}

describe('removeUniformBackground', () => {
  it('returns null when the border is not uniform', () => {
    const px: Pixel[][] = Array.from({ length: 8 }, (_, y) =>
      Array.from(
        { length: 8 },
        (_, x) =>
          [(x * 37) % 255, (y * 53) % 255, ((x + y) * 19) % 255, 255] as Pixel,
      ),
    )
    stubCanvas(gridToImageData(px))
    expect(removeUniformBackground(fakeImg(8, 8))).toBeNull()
  })

  it('returns null when too little or too much is removed', () => {
    
    const px: Pixel[][] = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => [255, 255, 255, 255] as Pixel),
    )
    stubCanvas(gridToImageData(px))
    expect(removeUniformBackground(fakeImg(8, 8))).toBeNull()
  })

  it('returns a dataUrl and corner array on a clean white-border image', () => {
    stubCanvas(gridToImageData(whiteBorderDarkCentre()))
    const result = removeUniformBackground(fakeImg(8, 8))
    expect(result).not.toBeNull()
    expect(result!.dataUrl).toBe('data:image/png;base64,PROCESSED')
    expect(result!.corners).toHaveLength(4)
  })

  it('returns null when getContext is unavailable', () => {
    ;(HTMLCanvasElement.prototype as any).getContext = jest.fn(() => null)
    expect(removeUniformBackground(fakeImg(8, 8))).toBeNull()
  })

  it('never throws when the image has zero size', () => {
    stubCanvas(gridToImageData(whiteBorderDarkCentre()))
    expect(() => removeUniformBackground(fakeImg(0, 0))).not.toThrow()
  })
})