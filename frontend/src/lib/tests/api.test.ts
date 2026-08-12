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

    it('DELETE makes request without body', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      })

      await api.delete('/test/123')
      
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/123'),
        expect.objectContaining({ method: 'DELETE' })
      )
      
      
      const callArgs = (global.fetch as jest.Mock).mock.calls[0]
      const options = callArgs[1]
      
      expect(options.body).toBeUndefined()
    })

  })

  describe('Error handling', () => {


    it('handles 401 with unauthorized handler', async () => {
      const handler = jest.fn()
      setUnauthorizedHandle(handler)
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({


        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      })

      await expect(api.get('/protected')).rejects.toMatchObject({ status: 401 })
      expect(handler).toHaveBeenCalled()
    })

    it('handles 400 with error message', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({


        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request' }),
      })

      await expect(api.get('/bad')).rejects.toMatchObject({
        status: 400,
        message: 'Bad request',
      })

    })

    it('handles array error messages', async () => {

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: ['Field is required', 'Field is invalid'] }),
      })

      await expect(api.get('/bad')).rejects.toMatchObject({

        status: 400,
        message: 'Field is required, Field is invalid',
      })
    })

    it('handles missing error message', async () => {


      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      await expect(api.get('/error')).rejects.toMatchObject({

        status: 500,
        message: 'Something went wrong. Please try again.',
      })
    })

    it('handles non-JSON response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({

        ok: false,
        status: 500,
        json: async () => { throw new Error('Invalid JSON') },
      })

      await expect(api.get('/error')).rejects.toMatchObject({

        status: 500,
        message: 'Something went wrong. Please try again.',
      })
    })
  })

  describe('buildQuery', () => {

    it('builds query string from object', () => {
      const params = { name: 'test', age: 25, empty: undefined, null: null }
      const result = buildQuery(params)


      expect(result).toBe('name=test&age=25')
    })

    it('handles empty object', () => {

      const result = buildQuery({})
      expect(result).toBe('')

    })

    it('handles boolean values', () => {

      const params = { active: true, featured: false }
      const result = buildQuery(params)

      expect(result).toBe('active=true&featured=false')
    })

    it('handles number values', () => {

      const params = { page: 1, limit: 10 }
      const result = buildQuery(params)


      expect(result).toBe('page=1&limit=10')
    })
  })

  describe('BASE_URL', () => {
    it('BASE_URL is defined', () => {


      expect(BASE_URL).toBeDefined()
      expect(typeof BASE_URL).toBe('string')

    })

  })
})