import { save, remove, mylist } from '../wishlist.api'
import { api } from '../api'

jest.mock('../api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}))


describe('Wishlist API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('save', () => {

    it('adds listing to wishlist', async () => {
      ;(api.post as jest.Mock).mockResolvedValueOnce(undefined)



      await save('123')
      expect(api.post).toHaveBeenCalledWith('/wishlist/123')

    })

    it('handles API error when saving', async () => {

      const error = new Error('Network error')

      ;(api.post as jest.Mock).mockRejectedValueOnce(error)

      await expect(save('123')).rejects.toThrow('Network error')
    })
  })

  describe('remove', () => {
    it('removes listing from wishlist', async () => {


      ;(api.delete as jest.Mock).mockResolvedValueOnce(undefined)

      await remove('123')
      expect(api.delete).toHaveBeenCalledWith('/wishlist/123')

    })

    it('handles API error when removing', async () => {
      const error = new Error('Network error')


      ;(api.delete as jest.Mock).mockRejectedValueOnce(error)

      await expect(remove('123')).rejects.toThrow('Network error')
    })
  })

  describe('mylist', () => {
    it('fetches wishlist items', async () => {


      const mockData = [{ listings_id: '123' }, { listings_id: '456' }]
      ;(api.get as jest.Mock).mockResolvedValueOnce(mockData)



      const result = await mylist()
      expect(api.get).toHaveBeenCalledWith('/wishlist/mine')
      
      expect(result).toEqual(mockData)


    })

    it('handles empty wishlist', async () => {
      ;(api.get as jest.Mock).mockResolvedValueOnce([])

      const result = await mylist()
      expect(result).toEqual([])
    })

    it('handles API error when fetching wishlist', async () => {

      const error = new Error('Network error')

      ;(api.get as jest.Mock).mockRejectedValueOnce(error)




      await expect(mylist()).rejects.toThrow('Network error')
    })
  })
})