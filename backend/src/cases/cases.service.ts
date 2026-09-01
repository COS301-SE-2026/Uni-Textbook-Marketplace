import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Case } from '../database/entities/case.entity';
import { User } from '../database/entities/users.entity';
import { AuditLog } from '../database/entities/audit_log.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { CaseResponseDto } from './dto/case-response.dto';
import { PaginatedCasesDto } from './dto/paginated-cases.dto';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private caseRepo: Repository<Case>,

    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
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

    const auditLog = this.auditLogRepo.create({
      entity_type: 'CASE',
      entity_id: savedCase.id,
      action: 'CREATE',
      performedBy: user,
      notes: `User ${user.email} submitted an appeal`,
      reason: dto.appeal_message.substring(0, 200),
    });
    await this.auditLogRepo.save(auditLog);

    return CaseResponseDto.fromEntity(savedCase);
  }

  async getUserCases(userId: string): Promise<CaseResponseDto[]> {
    const cases = await this.caseRepo.find({
      where: {
        user_id: userId,
      },
      relations: ['user'],
      order: {
        created_at: 'DESC',
      },
    });

    return cases.map((caseEntity) => CaseResponseDto.fromEntity(caseEntity));
  }

  async getCaseById(caseId: string, userId: string): Promise<CaseResponseDto> {
    const caseEntity = await this.caseRepo.findOne({
      where: {
        id: caseId,
        user_id: userId,
      },
      relations: ['user'],
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
      relations: ['user'],
      order: {
        created_at: 'ASC',
      },
    });

    return cases.map((caseEntity) => CaseResponseDto.fromEntity(caseEntity));
  }

  async getAllCases(
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
  ): Promise<PaginatedCasesDto> {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;

    const where: FindOptionsWhere<Case> = {};

    if (status && ['pending', 'upheld', 'reversed'].includes(status)) {
      where.status = status;
    }

    if (search) {
      where.appeal_message = ILike(`%${search}%`);
    }

    const [cases, total] = await this.caseRepo.findAndCount({
      where,
      relations: ['user'],
      order: {
        created_at: 'DESC',
      },
      skip,
      take: validLimit,
    });

    const data = cases.map((caseEntity) =>
      CaseResponseDto.fromEntity(caseEntity),
    );

    return PaginatedCasesDto.fromPaginatedResult({
      data,
      total,
      page: validPage,
      limit: validLimit,
    });
  }

  async reviewCase(
    caseId: string,
    adminId: string,
    decision: 'upheld' | 'reversed',
    adminNotes?: string,
  ): Promise<CaseResponseDto> {
    const caseEntity = await this.caseRepo.findOne({
      where: { id: caseId },
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
      relations: ['banned_by'],
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const user = await this.userRepo.findOne({
      where: { id: caseEntity.user_id },
      relations: ['banned_by'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    caseEntity.status = decision;
    caseEntity.reviewed_by = adminId;
    caseEntity.reviewed_at = new Date();

    await this.caseRepo.save(caseEntity);

    if (decision === 'reversed') {
      user.is_banned = false;
      user.banned_at = null;
      user.banned_by = null;
      user.ban_reason = null;
      await this.userRepo.save(user);

      const auditLog = this.auditLogRepo.create({
        entity_type: 'USER',
        entity_id: user.id,
        action: 'UPDATE',
        performedBy: admin,
        notes: `User ${user.email} was unbanned after appeal review. Case ID: ${caseId}`,
        reason: `Decision: ${decision}. Admin notes: ${adminNotes || 'No notes provided'}`,
      });
      await this.auditLogRepo.save(auditLog);

      const caseAuditLog = this.auditLogRepo.create({
        entity_type: 'CASE',
        entity_id: caseId,
        action: 'UPDATE',
        performedBy: admin,
        notes: `Case ${caseId} reviewed by admin. Decision: REVERSED (user unbanned)`,
        reason: adminNotes || 'No notes provided',
      });
      await this.auditLogRepo.save(caseAuditLog);
    } else {
      const auditLog = this.auditLogRepo.create({
        entity_type: 'CASE',
        entity_id: caseId,
        action: 'UPDATE',
        performedBy: admin,
        notes: `Appeal for user ${user.email} was upheld (ban remains). Case ID: ${caseId}`,
        reason: adminNotes || 'Ban upheld after appeal review',
      });
      await this.auditLogRepo.save(auditLog);
    }

    return CaseResponseDto.fromEntity(caseEntity);
  }
}
