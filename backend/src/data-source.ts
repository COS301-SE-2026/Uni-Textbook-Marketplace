// src/data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Import all entities
import { Faculty } from './database/entities/faculty.entity';
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
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [Faculty, User, Listing, Book, Module, University, OTP, AuditLog],
  migrations: ['src/database/migrations/*.ts'],
});
