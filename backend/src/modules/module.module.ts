import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleService } from './module.service';
import { ModuleController } from './module.controller';
import { Module as ModuleEntity } from '../database/entities/module.entity';
import { Faculty } from '../database/entities/faculty.entity';
import { University } from '../database/entities/university.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity, Faculty, University])],
  providers: [ModuleService],
  controllers: [ModuleController],
  exports: [ModuleService],
})
export class ModuleModule {}
