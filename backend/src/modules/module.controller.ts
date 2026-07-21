import { Controller, Get, Req, Query, Post, Body, UseGuards } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from '../modules/dto/create.module.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedUser {
  id: string;
}

interface RequestWithUser extends Request {
  user: AuthenticatedUser;
}

@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get()
  search(
    @Query('search') search: string,
    @Query('university') university: string,
  ) {
    return this.moduleService.search(search, university);
  }

  @Get('faculties')
  getFaculties() {
    return this.moduleService.getFaculties();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: RequestWithUser, @Body() dto: CreateModuleDto) {
    return await this.moduleService.create(req.user.id, dto);
  }
}
