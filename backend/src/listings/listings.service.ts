import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()//provider class
export class ListingsService{
    //mock listings:
    //id, title, isbn, edition, condition, annotationLevel, moduleCode, price, status, sellerId.
    private listings =[
        {
            id: "1",
            title: "title1",
            isbn: "isbn1",
            edition: "edition1",
            condition: "Excellent",
            annotationLevel: "annot1",
            moduleCode: "cos110",
            price: "100",
            status: "status1",
            sellerId: "ID-1",
            //do we want a message in each listing? the Post uses one
        },
        {
            id: "2",
            title: "title2",
            isbn: "isbn2",
            edition: "edition2",
            condition: "Excellent",
            annotationLevel: "annot2",
            moduleCode: "cos220",
            price: "200",
            status: "status2",
            sellerId: "ID-2"
        },
        {
            id: "3",
            title: "title3",
            isbn: "isbn3",
            edition: "edition3",
            condition: "Excellent",
            annotationLevel: "annot3",
            moduleCode: "cos330",
            price: "300",
            status: "status3",
            sellerId: "ID-3"
        },
    ];

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
    getListingById(id : string){
        const listing = this.listings.find(
            listing => listing.id === id,
        );
    }
}