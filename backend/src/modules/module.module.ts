import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module as ModuleEntity } from '../database/entities/module.entity';
import { ModuleController } from './module.controller';
import { ModuleService } from './module.service';
import { Faculty } from '../database/entities/faculty.entity';
import { University } from '../database/entities/university.entity';
import { User } from '../database/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleEntity, Faculty, University, User])],
  controllers: [ModuleController],
  providers: [ModuleService],
})
export class ModuleModule {}
