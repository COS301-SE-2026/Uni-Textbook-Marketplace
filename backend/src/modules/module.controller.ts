import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ModuleService } from './module.service';
import { CreateModuleDto } from '../modules/dto/create.module.dto';

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

  @Post()
  async create(@Body() dto: CreateModuleDto) {
    return await this.moduleService.create(dto);
  }
}
