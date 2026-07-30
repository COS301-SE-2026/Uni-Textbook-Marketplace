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

        mockValApi.get.mockResolvedValueOnce(responsMock)
        expect(await getListings()).toEqual(responsMock)

        expect(await getListings()).toEqual(responsMock)
        
    })
})