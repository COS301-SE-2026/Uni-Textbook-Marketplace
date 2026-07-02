import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { DataSource, Repository } from "typeorm";
import request from "supertest";

import { Listing } from "../src/database/entities/listing.entity";
import { User } from "../src/database/entities/users.entity";
import { Book } from "../src/database/entities/book.entity";
import { Module } from "../src/database/entities/module.entity";
import { University } from "../src/database/entities/university.entity";
import { ListingStatus } from "../src/database/entities/listing.entity";
import { JwtService } from "@nestjs/jwt";

const Test_Password = process.env.TEST_PASSWORD;

describe('ListingsController Integration Tests', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let listingRepository: Repository<Listing>;
    let userRepository: Repository<User>;
    let bookRepository: Repository<Book>;
    let moduleRepository: Repository<Module>;
    let universityRepository: Repository<University>;
    let jwtService: JwtService;

    // Test data
    const testUser = {
        email: 'u1234598@tuks.co.za',
        password: Test_Password,
        first_name: 'gift',
        last_name: 'mohub',
        faculty: 'EBIT'
    };

    const testAdmin = {
        email: 'admin@tuks.co.za',
        password: Test_Password,
        first_name: 'Admin',
        last_name: 'User',
        faculty: 'EBIT',
        role: 'admin'
    };
})