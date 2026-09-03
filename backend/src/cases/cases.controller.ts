import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { CaseResponseDto } from './dto/case-response.dto';
import { PaginatedCasesDto } from './dto/paginated-cases.dto';

interface AuthenticatedUser {
  id: string;
  role: string;
  is_banned?: boolean;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Cases')
@ApiBearerAuth()
@Controller('cases')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit an appeal as a banned user',
    description:
      'Only users with is_banned = true can submit appeals. Users cannot have multiple pending appeals.',
  })
  @ApiResponse({
    status: 201,
    description: 'Appeal submitted successfully',
    type: CaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'User is not banned or already has a pending appeal',
  })
  async createAppeal(
    @Req() req: RequestWithUser,
    @Body() dto: CreateCaseDto,
  ): Promise<CaseResponseDto> {
    return this.casesService.createAppeal(req.user.id, dto);
  }

  @Get('mine')
  @ApiOperation({
    summary: 'Get all cases for the authenticated user',
    description: 'Returns all cases submitted by the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of cases',
    type: [CaseResponseDto],
  })
  async getMyCases(@Req() req: RequestWithUser): Promise<CaseResponseDto[]> {
    return this.casesService.getUserCases(req.user.id);
  }

  @Get('admin/pending')
  @Roles('admin')
  @ApiOperation({
    summary: 'ADMIN ONLY - Get all pending cases',
    description: 'Returns all cases with status = pending for admin review',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending cases',
    type: [CaseResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  async getPendingCases(): Promise<CaseResponseDto[]> {
    return this.casesService.getPendingCases();
  }

  @Get('admin')
  @Roles('admin')
  @ApiOperation({
    summary: 'ADMIN ONLY - Get all cases with pagination',
    description: 'Returns all cases with pagination for admin dashboard',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of cases',
    type: PaginatedCasesDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20, max: 100)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status (pending, upheld, reversed)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search in appeal message',
  })
  async getAllCases(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<PaginatedCasesDto> {
    return this.casesService.getAllCases(page, limit, status, search);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific case by ID',
    description: 'Users can only access their own cases',
  })
  @ApiResponse({
    status: 200,
    description: 'Case found',
    type: CaseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Case not found',
  })
  async getCaseById(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<CaseResponseDto> {
    return this.casesService.getCaseById(id, req.user.id);
  }

  @Patch(':id/review')
  @Roles('admin')
  @ApiOperation({
    summary: 'ADMIN ONLY - Review a case',
    description:
      'Uphold or reverse the ban based on the case review. If reversed, the user is unbanned.',
  })
  @ApiResponse({
    status: 200,
    description: 'Case reviewed successfully',
    type: CaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Case already reviewed or invalid decision',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
  })
  @ApiResponse({
    status: 404,
    description: 'Case not found',
  })
  async reviewCase(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: { decision: 'upheld' | 'reversed'; adminNotes?: string },
  ): Promise<CaseResponseDto> {
    if (!body.decision || !['upheld', 'reversed'].includes(body.decision)) {
      throw new BadRequestException('Decision must be "upheld" or "reversed"');
    }

    return this.casesService.reviewCase(
      id,
      req.user.id,
      body.decision,
      body.adminNotes,
    );
  }
}
