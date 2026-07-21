import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module as ModuleEntity } from '../database/entities/module.entity';
import { Faculty } from '../database/entities/faculty.entity';
import { University } from '../database/entities/university.entity';
import { User } from '../database/entities/users.entity';
import { CreateModuleDto } from '../modules/dto/create.module.dto';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(ModuleEntity)
    private moduleRepo: Repository<ModuleEntity>,
    @InjectRepository(Faculty)
    private facultyRepo: Repository<Faculty>,
    @InjectRepository(University)
    private universityRepo: Repository<University>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
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

  async getFaculties() {
    return this.facultyRepo.find({
      select: {
        id: true,
        name: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async create(userId: string, dto: CreateModuleDto): Promise<ModuleEntity> {
    const existing = await this.moduleRepo.findOne({
      where: { code: dto.code },
    });
    if (existing) return existing;

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['university'],
    });

    const universityId = user?.university?.id ?? dto.university_id;
    if (!universityId) {
      throw new Error('User university not found');
    }

    if (!dto.faculty_id) {
      throw new Error('Faculty ID is required');
    }

    const faculty = await this.facultyRepo.findOne({
      where: { id: dto.faculty_id },
    });

    const university = await this.universityRepo.findOne({
      where: { id: universityId },
    });

    if (!faculty) {
      throw new Error(`Faculty with ID ${dto.faculty_id} not found`);
    }
    if (!university) {
      throw new Error(`University with ID ${universityId} not found`);
    }

    const module = this.moduleRepo.create({
      code: dto.code,
      name: dto.name,
      faculty,
      university,
      semester: dto.semester,
    });

    return this.moduleRepo.save(module);
  }
}
