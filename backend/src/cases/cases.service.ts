import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from '../database/entities/case.entity';
import { User } from '../database/entities/users.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { CaseResponseDto } from './dto/case-response.dto';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private caseRepo: Repository<Case>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createAppeal(
    userId: string,
    dto: CreateCaseDto,
  ): Promise<CaseResponseDto> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.is_banned) {
      throw new BadRequestException(
        'You are not banned. Appeals are only for banned users.',
      );
    }

    const existingPendingCase = await this.caseRepo.findOne({
      where: {
        user_id: userId,
        status: 'pending',
      },
    });

    if (existingPendingCase) {
      throw new BadRequestException(
        'You already have a pending appeal. Please wait for it to be reviewed.',
      );
    }

    const newCase = this.caseRepo.create({
      user_id: userId,
      appeal_message: dto.appeal_message,
      status: 'pending',
    });

    const savedCase = await this.caseRepo.save(newCase);
    return CaseResponseDto.fromEntity(savedCase);
  }

  async getUserCases(userId: string): Promise<CaseResponseDto[]> {
    const cases = await this.caseRepo.find({
      where: {
        user_id: userId,
      },
      relations: ['user', 'reviewer'],
      order: {
        created_at: 'DESC',
      },
    });

    return cases.map((c) => CaseResponseDto.fromEntity(c));
  }

  async getCaseById(caseId: string, userId: string): Promise<CaseResponseDto> {
    const caseEntity = await this.caseRepo.findOne({
      where: {
        id: caseId,
        user_id: userId,
      },
      relations: ['user', 'reviewer'],
    });

    if (!caseEntity) {
      throw new NotFoundException('Case not found');
    }

    return CaseResponseDto.fromEntity(caseEntity);
  }

  async getPendingCases(): Promise<CaseResponseDto[]> {
    const cases = await this.caseRepo.find({
      where: {
        status: 'pending',
      },
      relations: ['user', 'reviewer'],
      order: {
        created_at: 'ASC',
      },
    });

    return cases.map((c) => CaseResponseDto.fromEntity(c));
  }

  async reviewCase(
    caseId: string,
    adminId: string,
    decision: 'upheld' | 'reversed',
    adminNotes?: string,
  ): Promise<CaseResponseDto> {
    const caseEntity = await this.caseRepo.findOne({
      where: { id: caseId },
      relations: ['user'],
    });

    if (!caseEntity) {
      throw new NotFoundException('Case not found');
    }

    if (caseEntity.status !== 'pending') {
      throw new BadRequestException(
        `This case has already been reviewed. Status: ${caseEntity.status}`,
      );
    }

    const admin = await this.userRepo.findOne({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    caseEntity.status = decision;
    caseEntity.reviewed_by = adminId;
    caseEntity.reviewed_at = new Date();

    await this.caseRepo.save(caseEntity);

    //If decision is REVERSED, we will unban the user
    if (decision === 'reversed') {
      await this.userRepo.update(
        { id: caseEntity.user_id },
        {
          is_banned: false,
          banned_at: null,
          banned_by: null,
          ban_reason: null,
        },
      );
    }

    return CaseResponseDto.fromEntity(caseEntity);
  }
}
