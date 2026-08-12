import { api, buildQuery, setUnauthorizedHandle, BASE_URL } from '../api'


global.fetch = jest.fn()

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('HTTP methods', () => {

    it('GET makes correct request', async () => {


      const mockResponse = { data: 'test' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.get('/test')


      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),

        expect.objectContaining({ method: 'GET' })
      )
      expect(result).toEqual(mockResponse)
    })

    it('POST sends body correctly', async () => {
      const body = { name: 'test' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({

        ok: true,
        json: async () => ({ success: true }),
      })

      await api.post('/test', body)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      )
    })

    it('PATCH sends body correctly', async () => {

      const body = { status: 'updated' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({

        ok: true,
        json: async () => ({ success: true }),
      })

      await api.patch('/test', body)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(body),
        })
      )
    })

    

  })
})