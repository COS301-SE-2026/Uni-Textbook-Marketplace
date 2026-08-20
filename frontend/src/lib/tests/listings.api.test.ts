import {
    getListings,
    createListing,
    editListing,
    getMyListings,
    getFaculties,
    uploadImages
} from '../listings.api'

import { api } from '../api'


jest.mock('../api')

const mockValApi = jest.mocked(api)

describe('listings.api', () => {
    beforeEach(() => jest.clearAllMocks())


    it('fetches listings with and without query params', async () => {

        const responsMock = { listings: [{ id: '1' }], total: 1 }

        mockValApi.get.mockResolvedValue(responsMock)
        expect(await getListings()).toEqual(responsMock)

        expect(mockValApi.get).toHaveBeenCalledWith('/listings')

        await getListings('faculty=EBIT&condition=new')
        
        expect(mockValApi.get).toHaveBeenCalledWith('/listings?faculty=EBIT&condition=new')

    })
    it('handles listing creation and updates', async () => {
        const payload = { title: 'Book', price: 100 } as any
        
        mockValApi.post.mockResolvedValueOnce({ id: 'new' })
        mockValApi.patch.mockResolvedValueOnce({ success: true })

        await createListing(payload)

        expect(mockValApi.post).toHaveBeenCalledWith('/listings', payload)

        await editListing(payload)

        expect(mockValApi.patch).toHaveBeenCalledWith('/listings/editlist', payload)

    })

    it('fetches single listing and faculties', async () => {

        mockValApi.get.mockResolvedValueOnce({ id: '123', title: 'Test' })

        expect(await getMyListings('123')).toEqual({ id: '123', title: 'Test' })

        expect(mockValApi.get).toHaveBeenCalledWith('/listings/123')

        mockValApi.get.mockResolvedValueOnce([{ id: '1', name: 'EBIT' }])

        expect(await getFaculties()).toEqual([{ id: '1', name: 'EBIT' }])
        expect(mockValApi.get).toHaveBeenCalledWith('/modules/faculties')

    })


    it('uploads images or handles empty input', async () => {

        expect(await uploadImages([])).toEqual({ urls: [] })


        const imageRespons = { urls: ['http://example.com/image.jpg'] }

        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => imageRespons,

        })

        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

        expect(await uploadImages([file])).toEqual(imageRespons)

    })
})