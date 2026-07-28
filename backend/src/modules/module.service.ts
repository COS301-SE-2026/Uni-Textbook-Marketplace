import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module as ModuleEntity } from '../database/entities/module.entity';
import { CreateModuleDto } from '../modules/dto/create.module.dto';
import { Faculty } from '../database/entities/faculty.entity';
import { User } from '../database/entities/users.entity';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly moduleRepo: Repository<ModuleEntity>,
    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async search(search: string, university: string) {
    return this.moduleRepo
      .createQueryBuilder('module')
      .leftJoinAndSelect('module.university', 'university')
      .leftJoinAndSelect('module.faculty', 'faculty')
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
      where: {
        code: dto.code,
        name: dto.name,
        semester: dto.semester,
        faculty: { id: dto.faculty_id },
      },
    });

    if (existing) {
      return existing;
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['university'],
    });

    const universityId = user?.university?.id ?? dto.university;
    if (!universityId) {
      throw new Error('User university not found');
    }

    if (!dto.faculty_id) {
      throw new Error('Faculty ID is required');
    }

    const faculty = await this.facultyRepo.findOne({
      where: { id: dto.faculty_id },
    });

    if (!faculty) {
      throw new NotFoundException('faculty not found');
    }

    const module = this.moduleRepo.create({
      code: dto.code,
      name: dto.name,
      faculty,
      university: user?.university,
      semester: dto.semester,
    });

    return this.moduleRepo.save(module);
  }

  async findAll(): Promise<ModuleEntity[]> {
    return this.moduleRepo.find({
      relations: ['faculty', 'university'],
    });
  }

  async findOne(id: string): Promise<ModuleEntity> {
    const module = await this.moduleRepo.findOne({
      where: { id },
      relations: ['faculty', 'university'],
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    return module;
  }

  async findByUniversity(universityId: string): Promise<ModuleEntity[]> {
    return this.moduleRepo.find({
      where: { university: { id: universityId } },
      relations: ['faculty'],
    });
  }

  async findByFaculty(facultyId: string): Promise<ModuleEntity[]> {
    return this.moduleRepo.find({
      where: { faculty: { id: facultyId } },
      relations: ['university'],
    });
  }
}
