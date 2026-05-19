import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()//provider class
export class ListingsService{
    //mock listings:
    //id, title, isbn, edition, condition, annotationLevel, moduleCode, price, status, sellerId.
    private readonly listings = Object.freeze([
        Object.freeze({
            id: "1",
            title: "title1",
            isbn: "isbn1",
            edition: "edition1",
            condition: "Excellent",
            annotationLevel: "annot1",
            moduleCode: "cos110",
            price: "100",
            status: "PENDING",
            sellerId: "ID-1",
            //do we want a message in each listing? the Post uses one
        }),
        Object.freeze({
            id: "1a",
            title: "title1a",
            isbn: "isbn1a",
            edition: "edition1a",
            condition: "Excellent",
            annotationLevel: "annot1a",
            moduleCode: "cos110",
            price: "100",
            status: "APPROVED",
            sellerId: "ID-1",
            //do we want a message in each listing? the Post uses one
        }),
        Object.freeze({
            id: "2",
            title: "title2",
            isbn: "isbn2",
            edition: "edition2",
            condition: "Excellent",
            annotationLevel: "annot2",
            moduleCode: "cos220",
            price: "200",
            status: "APPROVED",
            sellerId: "ID-2"
        }),
        Object.freeze({
            id: "3",
            title: "title3",
            isbn: "isbn3",
            edition: "edition3",
            condition: "Excellent",
            annotationLevel: "annot3",
            moduleCode: "cos330",
            price: "300",
            status: "REJECTED",
            sellerId: "ID-3"
        }),
    ]);

    //Post /listings:
    createListing() {
        return {
        id: 'mock-uuid',
        status: 'PENDING',
        message: 'Listing submitted for review',
        };
    };

    //GET /listings
    getAllListings(){
        return this.listings;
    }

    //GET /myListings
    getMyListings(){
        return this.listings.filter(
            listing => listing.sellerId === "ID-1",
        );
    }

    //GET ListingById
    getListingById(id: string) {
        const listing = this.listings.find(
            listing => listing.id === id,
        );

        if (!listing) {
            throw new NotFoundException('Listing not found');
        }

        return listing;
    }
}