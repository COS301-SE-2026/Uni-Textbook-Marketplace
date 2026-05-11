import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()//provider class
export class ListingsService{
    //mock listings:
    //id, title, isbn, edition, condition, annotationLevel, moduleCode, price, status, sellerId.
    private Listings =[
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
            sellerID: "ID-1"
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
            sellerID: "ID-2"
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
            sellerID: "ID-3"
        },
        
    ]
}