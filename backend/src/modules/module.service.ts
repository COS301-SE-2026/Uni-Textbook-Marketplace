import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Module as ModuleEntity } from '../database/entities/module.entity';
import { CreateModuleDto } from '../modules/dto/create.module.dto';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(ModuleEntity)
    private moduleRepo: Repository<ModuleEntity>,
  ) {}

  async search(search: string, university: string) {
    return this.moduleRepo
      .createQueryBuilder('module')
      .leftJoinAndSelect('module.university', 'university')
      .where('module.code ILIKE :search', {
        search: `%${search}%`,
      })
      .andWhere('university.name ILIKE :university', {
        university: `%${university}%`,
      })
      .getMany();
  }

  async create(dto: CreateModuleDto): Promise<ModuleEntity> {
    const existing = await this.moduleRepo.findOne({
      where: { code: dto.code },
    });
    if (existing) return existing;
    return this.moduleRepo.save(this.moduleRepo.create(dto));
  }
}
