import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Book } from '../database/entities/book.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VisionController } from './vision.controller';
import { VisionService } from './vision.service';

@Module({
  imports: [TypeOrmModule.forFeature([Book])],
  controllers: [VisionController],
  providers: [VisionService, RolesGuard, JwtAuthGuard],
})
export class VisionModule {}
