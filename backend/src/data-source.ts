import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

import { User } from './database/entities/users.entity';
import { Listing } from './database/entities/listing.entity';
import { Book } from './database/entities/book.entity';
import { Module } from './database/entities/module.entity';
import { University } from './database/entities/university.entity';
import { OTP } from './database/entities/otps.entity';
import { AuditLog } from './database/entities/audit_log.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',

  url: 'postgres://nexusdev:nexusdev_local@localhost:5432/textbook_marketplace',

  synchronize: false,
  logging: true,

  entities: [User, Listing, Book, Module, University, OTP, AuditLog],

  migrations: ['src/database/migrations/*.ts'],
});
