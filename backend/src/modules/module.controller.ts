import { Controller, Get, Query } from '@nestjs/common';
import { ModuleService } from './module.service';

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
}
