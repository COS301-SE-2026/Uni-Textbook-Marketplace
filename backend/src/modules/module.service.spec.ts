import { NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { Faculty } from '../database/entities/faculty.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';
import { User } from '../database/entities/users.entity';
import { CreateModuleDto } from './dto/create.module.dto';
import { ModuleService } from './module.service';

describe('ModuleService', () => {
  const moduleRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const facultyRepo = { findOne: jest.fn() };
  const userRepo = { findOne: jest.fn() };

  let service: ModuleService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ModuleService(
      moduleRepo as unknown as Repository<ModuleEntity>,
      facultyRepo as unknown as Repository<Faculty>,
      userRepo as unknown as Repository<User>,
    );
  });

  it('updates an existing module with the submitted details', async () => {
    const faculty = { id: 'faculty-1' } as Faculty;
    const existing = {
      code: 'COMP101',
      name: 'Old module name',
      faculty: { id: 'old-faculty' },
      semester: 1,
    } as ModuleEntity;
    const dto: CreateModuleDto = {
      code: 'COMP101',
      name: 'New module name',
      faculty_id: 'faculty-1',
      semester: 2,
    };

    userRepo.findOne.mockResolvedValue({ university: { id: 'university-1' } });
    facultyRepo.findOne.mockResolvedValue(faculty);
    moduleRepo.findOne.mockResolvedValue(existing);
    moduleRepo.save.mockImplementation(async (module: ModuleEntity) => module);

    const result = await service.create('user-1', dto);

    expect(moduleRepo.findOne).toHaveBeenCalledWith({
      where: { code: dto.code, university: { id: 'university-1' } },
      relations: ['faculty', 'university'],
    });
    expect(moduleRepo.save).toHaveBeenCalledWith({
      ...existing,
      name: dto.name,
      faculty,
      semester: dto.semester,
    });
    expect(result).toBe(existing);
  });

  it('updates an existing module when faculty is omitted and preserves its faculty', async () => {
    const existingFaculty = { id: 'existing-faculty' } as Faculty;
    const existing = {
      code: 'COMP101',
      name: 'Old module name',
      faculty: existingFaculty,
      semester: 1,
    } as ModuleEntity;

    userRepo.findOne.mockResolvedValue({ university: { id: 'university-1' } });
    moduleRepo.findOne.mockResolvedValue(existing);
    moduleRepo.save.mockImplementation(async (module: ModuleEntity) => module);

    const result = await service.create(
      'user-1',
      {
        code: 'COMP101',
        name: 'New module name',
        semester: 2,
      } as CreateModuleDto,
    );

    expect(moduleRepo.save).toHaveBeenCalledWith({
      ...existing,
      name: 'New module name',
      semester: 2,
    });
    expect(result.faculty).toBe(existingFaculty);
  });

  it('updates the winning module after a duplicate-code race', async () => {
    const faculty = { id: 'faculty-1' } as Faculty;
    const existing = {
      code: 'COMP101',
      name: 'Concurrent module name',
      faculty: { id: 'old-faculty' },
      semester: 1,
    } as ModuleEntity;
    const newModule = { code: 'COMP101' } as ModuleEntity;
    const dto: CreateModuleDto = {
      code: 'COMP101',
      name: 'Submitted module name',
      faculty_id: 'faculty-1',
      semester: 2,
    };
    const driverError = Object.assign(new Error('duplicate key'), {
      code: '23505',
    });
    const duplicateError = new QueryFailedError('INSERT', [], driverError);

    userRepo.findOne.mockResolvedValue({ university: { id: 'university-1' } });
    facultyRepo.findOne.mockResolvedValue(faculty);
    moduleRepo.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existing);
    moduleRepo.create.mockReturnValue(newModule);
    moduleRepo.save
      .mockRejectedValueOnce(duplicateError)
      .mockResolvedValueOnce(existing);

    const result = await service.create('user-1', dto);

    expect(moduleRepo.findOne).toHaveBeenNthCalledWith(1, {
      where: { code: dto.code, university: { id: 'university-1' } },
      relations: ['faculty', 'university'],
    });
    expect(moduleRepo.findOne).toHaveBeenNthCalledWith(2, {
      where: { code: dto.code, university: { id: 'university-1' } },
      relations: ['faculty', 'university'],
    });
    expect(moduleRepo.save).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        name: dto.name,
        faculty,
        semester: dto.semester,
      }),
    );
    expect(result).toBe(existing);
  });

  it('still requires faculty when creating a new module', async () => {
    userRepo.findOne.mockResolvedValue({ university: { id: 'university-1' } });
    moduleRepo.findOne.mockResolvedValue(null);

    await expect(
      service.create(
        'user-1',
        {
          code: 'COMP101',
          name: 'Module name',
          semester: 1,
        } as CreateModuleDto,
      ),
    ).rejects.toThrow('Faculty ID is required');
    expect(moduleRepo.create).not.toHaveBeenCalled();
  });

  it('throws when the submitted faculty does not exist', async () => {
    userRepo.findOne.mockResolvedValue({ university: { id: 'university-1' } });
    facultyRepo.findOne.mockResolvedValue(null);

    await expect(
      service.create('user-1', {
        code: 'COMP101',
        name: 'Module name',
        faculty_id: 'missing-faculty',
        semester: 1,
      }),
    ).rejects.toThrow(new NotFoundException('faculty not found'));
    expect(moduleRepo.findOne).not.toHaveBeenCalled();
  });
});
