import { describe, expect, it, jest } from '@jest/globals';
import { optimizeBundle } from '../bundles.api';

describe('optimizeBundle', () => {
    const mockFetch = jest.fn<typeof fetch>();

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = mockFetch;
    });

    it('should return an optimized bundle with seller groups', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                optimizedBundle: {
                    listings: [
                        {
                            id: 'listing-1',
                            title: 'Calculus Textbook',
                            price: 450,
                            seller: {
                                id: 'seller-1',
                                first_name: 'John',
                                last_name: 'Smith',
                            },
                        },
                        {
                            id: 'listing-2',
                            title: 'Physics Textbook',
                            price: 350,
                            seller: {
                                id: 'seller-1',
                                first_name: 'John',
                                last_name: 'Smith',
                            },
                        },
                        {
                            id: 'listing-3',
                            title: 'Computer Science Textbook',
                            price: 500,
                            seller: {
                                id: 'seller-2',
                                first_name: 'Jane',
                                last_name: 'Doe',
                            },
                        },
                    ],
                    totalPrice: 1300,
                    sellerIds: ['seller-1', 'seller-2'],
                },
                cheapestIndividualOption: {
                    totalPrice: 1400,
                    sellerIds: ['seller-1', 'seller-2', 'seller-3'],
                },
            }),
        } as Response);

        const result = await optimizeBundle([
            'module-1',
            'module-2',
            'module-3',
        ]);

        expect(result).toEqual({
            recommended: {
                sellerGroups: [
                    {
                        sellerId: 'seller-1',
                        sellerName: 'John Smith',
                        listings: [
                            {
                                id: 'listing-1',
                                title: 'Calculus Textbook',
                                price: 450,
                                sellerId: 'seller-1',
                                sellerName: 'John Smith',
                            },
                            {
                                id: 'listing-2',
                                title: 'Physics Textbook',
                                price: 350,
                                sellerId: 'seller-1',
                                sellerName: 'John Smith',
                            },
                        ],
                        booksCovered: 2,
                        subtotal: 800,
                    },
                    {
                        sellerId: 'seller-2',
                        sellerName: 'Jane Doe',
                        listings: [
                            {
                                id: 'listing-3',
                                title: 'Computer Science Textbook',
                                price: 500,
                                sellerId: 'seller-2',
                                sellerName: 'Jane Doe',
                            },
                        ],
                        booksCovered: 1,
                        subtotal: 500,
                    },
                ],
                totalPrice: 1300,
                sellerCount: 2,
                meetupCount: 2,
            },
            naive: {
                totalPrice: 1400,
                sellerCount: 3,
            },
        });
    });

    it('should send the module IDs to the API', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                optimizedBundle: {
                    listings: [],
                    totalPrice: 0,
                    sellerIds: [],
                },
                cheapestIndividualOption: {
                    totalPrice: 0,
                    sellerIds: [],
                },
            }),
        } as Response);

        await optimizeBundle(['module-1', 'module-2']);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/bundles/optimize'),
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    moduleIds: ['module-1', 'module-2'],
                }),
            }),
        );
    });

    it('should throw an error when the API request fails', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 500,
            text: async () => 'Internal server error',
        } as Response);

        await expect(
            optimizeBundle(['module-1']),
        ).rejects.toThrow('Internal server error');
    });
    
});