import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
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

  async search(search: string, university?: string) {
    const query = this.moduleRepo
      .createQueryBuilder('module')
      .leftJoinAndSelect('module.university', 'university')
      .leftJoinAndSelect('module.faculty', 'faculty')
      .where('module.code ILIKE :search', {
        search: `%${search}%`,
      });

    if (university) {
      query.andWhere('university.name ILIKE :university', {
        university: `%${university}%`,
      });
    }

    return query.getMany();
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
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['university'],
    });

    const universityId = user?.university?.id ?? dto.university;
    if (!universityId) {
      throw new Error('User university not found');
    }

    const faculty = dto.faculty_id
      ? await this.facultyRepo.findOne({ where: { id: dto.faculty_id } })
      : null;

    if (dto.faculty_id && !faculty) {
      throw new NotFoundException('faculty not found');
    }

    const existing = await this.moduleRepo.findOne({
      where: { code: dto.code, university: { id: universityId } },
      relations: ['faculty', 'university'],
    });

    if (existing) {
      return this.moduleRepo.save(
        this.applySubmittedDetails(existing, dto, faculty),
      );
    }

    if (!faculty) {
      throw new Error('Faculty ID is required');
    }

    const module = this.moduleRepo.create({
      code: dto.code,
      name: dto.name,
      faculty,
      university: user?.university ?? { id: universityId },
      semester: dto.semester,
    });

    try {
      return await this.moduleRepo.save(module);
    } catch (error) {
      const databaseError = error as QueryFailedError & {
        code?: string;
        driverError?: { code?: string };
      };
      const isDuplicateKeyError =
        error instanceof QueryFailedError &&
        (databaseError.code ?? databaseError.driverError?.code) === '23505';

      if (isDuplicateKeyError) {
        const raceExisting = await this.moduleRepo.findOne({
          where: { code: dto.code, university: { id: universityId } },
          relations: ['faculty', 'university'],
        });
        if (raceExisting) {
          return this.moduleRepo.save(
            this.applySubmittedDetails(raceExisting, dto, faculty),
          );
        }
      }

      throw error;
    }
  }

  private applySubmittedDetails(
    module: ModuleEntity,
    dto: CreateModuleDto,
    faculty: Faculty | null,
  ): ModuleEntity {
    module.name = dto.name;
    if (faculty) module.faculty = faculty;
    module.semester = dto.semester;
    return module;
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
