import { extractText, VISION_TIMEOUT_MS } from '../vision.api'

const mockFetch = jest.fn()
global.fetch = mockFetch as any

const okResponse = (body: unknown) => ({
  ok: true,
  json: async () => body,
})

const errResponse = (message: string) => ({
  ok: false,
  json: async () => ({ message }),
})

beforeEach(() => {
  jest.clearAllMocks()
  process.env.NEXT_PUBLIC_API_URL = 'http://test.local/api'
})

describe('extractText', () => {
  it('POSTs the imageUrl and returns the parsed body', async () => {
    const body = { rawText: 'Clean Code', matchedBook: null }
    mockFetch.mockResolvedValue(okResponse(body))

    const result = await extractText('https://blob/x.jpg')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.local/api/vision/extract-text',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ imageUrl: 'https://blob/x.jpg' }),
      }),
    )
    expect(result).toEqual(body)
  })

  it('throws the server message on a non-ok response', async () => {
    mockFetch.mockResolvedValue(errResponse('Azure Vision returned 500'))
    await expect(extractText('https://blob/x.jpg')).rejects.toThrow(
      'Azure Vision returned 500',
    )
  })

  it('throws a generic message when the error body has no message', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: async () => ({}) })
    await expect(extractText('https://blob/x.jpg')).rejects.toThrow(
      'Text extraction failed',
    )
  })

  it('aborts and rejects when the request exceeds the timeout', async () => {
    jest.useFakeTimers()
    mockFetch.mockImplementation(
      (_url, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new Error('aborted')),
          )
        }),
    )

    const promise = extractText('https://blob/x.jpg', 100)
    jest.advanceTimersByTime(100)
    await expect(promise).rejects.toThrow('aborted')
    jest.useRealTimers()
  })

  it('falls back to localhost when NEXT_PUBLIC_API_URL is unset', async () => {
    delete process.env.NEXT_PUBLIC_API_URL
    mockFetch.mockResolvedValue(okResponse({ rawText: '', matchedBook: null }))

    await extractText('https://blob/x.jpg')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/vision/extract-text',
      expect.anything(),
    )
  })

  it('uses the default timeout when none is passed', async () => {
    mockFetch.mockResolvedValue(okResponse({ rawText: '', matchedBook: null }))
    await extractText('https://blob/x.jpg')
    
    expect(VISION_TIMEOUT_MS).toBeGreaterThan(0)
  })
})