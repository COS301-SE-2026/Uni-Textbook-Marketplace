import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import { Faculty } from './database/entities/faculty.entity';
import { User } from './database/entities/users.entity';
import { Listing } from './database/entities/listing.entity';
import { Book } from './database/entities/book.entity';
import { Module } from './database/entities/module.entity';
import { University } from './database/entities/university.entity';
import { OTP } from './database/entities/otps.entity';
import { AuditLog } from './database/entities/audit_log.entity';
import { SavedSearch } from './database/entities/saved_search.entity';
import { Wishlist } from './database/entities/wishlist.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [
    Faculty,
    User,
    Listing,
    Book,
    Module,
    University,
    OTP,
    AuditLog,
    SavedSearch,
    Wishlist,
  ],
  migrations: ['src/database/migrations/*.ts'],
});

console.log(
  'Entity classes registered:',
  [
    Faculty,
    User,
    Listing,
    Book,
    Module,
    University,
    OTP,
    AuditLog,
    SavedSearch,
    Wishlist,
  ].map((e) => e?.name || 'undefined'),
);
