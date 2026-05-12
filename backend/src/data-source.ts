/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import { User } from './database/entities/users.entity';
import { Listing } from './database/entities/listing.entity';
import process from 'process';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  synchronize: false,

  logging: true,

  entities: [User, Listing],

  migrations: ['src/database/migrations/*.ts'],
});
