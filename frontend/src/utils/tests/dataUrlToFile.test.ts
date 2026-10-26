import { dataUrlToFile } from '../dataUrlToFile'

const makeImage = (w: number, h: number) => {
  const img: any = { naturalWidth: w, naturalHeight: h, onload: null, onerror: null }
  let srcValue = ''
  Object.defineProperty(img, 'src', {
    get: () => srcValue,
    set: (v: string) => {
      srcValue = v
      Promise.resolve().then(() => img.onload?.())
    },
    configurable: true,
  })
  return img
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(global as any).Image = jest.fn()
  ;(global as any).fetch = jest.fn()
  ;(HTMLCanvasElement.prototype as any).getContext = jest.fn(() => ({
    drawImage: jest.fn(),
  }))
  ;(HTMLCanvasElement.prototype as any).toBlob = jest.fn((cb: BlobCallback) =>
    cb(new Blob(['x'], { type: 'image/jpeg' })),
  )
})

describe('dataUrlToFile', () => {
  it('uses the original blob when the image is within the size limit', async () => {
    ;(Image as unknown as jest.Mock).mockImplementation(() => makeImage(800, 600))
    const originalBlob = new Blob(['original'], { type: 'image/jpeg' })
    ;(fetch as jest.Mock).mockResolvedValue({ blob: async () => originalBlob })

    const file = await dataUrlToFile('data:image/jpeg;base64,AAA', 'scan')

    expect(fetch).toHaveBeenCalledWith('data:image/jpeg;base64,AAA')
    expect(file.type).toBe('image/jpeg')
    expect(file.name).toMatch(/^scan-\d+\.jpg$/)
  })

  it('downscales via canvas when the image exceeds the max side', async () => {
    ;(Image as unknown as jest.Mock).mockImplementation(() =>
      makeImage(3200, 2400),
    )

    const file = await dataUrlToFile('data:image/jpeg;base64,BBB')

    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalled()
    expect(HTMLCanvasElement.prototype.toBlob).toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
    expect(file.type).toBe('image/jpeg')
  })

  it('rejects when the image fails to load', async () => {
    ;(Image as unknown as jest.Mock).mockImplementation(() => {
      const img: any = { onload: null, onerror: null }
      Object.defineProperty(img, 'src', {
        set: () => Promise.resolve().then(() => img.onerror?.()),
      })
      return img
    })

    await expect(
      dataUrlToFile('data:image/jpeg;base64,BAD'),
    ).rejects.toThrow('Failed to read cropped image')
  })

  it('rejects when the canvas context is unavailable', async () => {
    ;(Image as unknown as jest.Mock).mockImplementation(() =>
      makeImage(3200, 2400),
    )
    ;(HTMLCanvasElement.prototype as any).getContext = jest.fn(() => null)

    await expect(
      dataUrlToFile('data:image/jpeg;base64,CCC'),
    ).rejects.toThrow('Canvas 2D context unavailable')
  })

  it('rejects when canvas.toBlob returns null', async () => {
    ;(Image as unknown as jest.Mock).mockImplementation(() =>
      makeImage(3200, 2400),
    )
    ;(HTMLCanvasElement.prototype as any).toBlob = jest.fn((cb: BlobCallback) =>
      cb(null),
    )

    await expect(
      dataUrlToFile('data:image/jpeg;base64,DDD'),
    ).rejects.toThrow('Image encoding failed')
  })

  it('defaults the filename prefix to "photo"', async () => {
    ;(Image as unknown as jest.Mock).mockImplementation(() => makeImage(100, 100))
    ;(fetch as jest.Mock).mockResolvedValue({
      blob: async () => new Blob(['x'], { type: 'image/jpeg' }),
    })

    const file = await dataUrlToFile('data:image/jpeg;base64,EEE')

    expect(file.name).toMatch(/^photo-\d+\.jpg$/)
  })
})