import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module as ModuleEntity } from '../database/entities/module.entity';
import { CreateModuleDto } from '../modules/dto/create.module.dto';
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
      where: { code: dto.code },
    });

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

    if (dto.university) {
      university = await this.universityRepo.findOne({
        where: { name: dto.university },
      });
      if (!university) {
        university = this.universityRepo.create({ name: dto.university });
        await this.universityRepo.save(university);
      }
    } else {
      university = await this.universityRepo.findOne({
        where: { name: 'University of Pretoria' },
      });
      if (!university) {
        university = this.universityRepo.create({
          name: 'University of Pretoria',
        });
        await this.universityRepo.save(university);
      }
    }

    let faculty: Faculty | null = null;

    if (dto.faculty) {
      faculty = await this.facultyRepo.findOne({
        where: { name: dto.faculty },
      });
      if (!faculty) {
        faculty = this.facultyRepo.create({
          name: dto.faculty,
          university: university,
        });
        await this.facultyRepo.save(faculty);
      }
    } else if (dto.faculty_id) {
      faculty = await this.facultyRepo.findOne({
        where: { id: dto.faculty_id },
      });
      if (!faculty) {
        throw new NotFoundException(`
          Faculty with ID ${dto.faculty_id} not found`);
      }
    }
    if (!university) {
      throw new Error(`University with ID ${universityId} not found`);
    }

    // Create the module with required relations
    const module = this.moduleRepo.create({
      code: dto.code,
      name: dto.name,
      faculty,
      university,
      semester: dto.semester,
      university: university,
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
