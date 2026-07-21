import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';

import { SavedSearchesService } from './saved_search.service';
import {
  CreateSavedSearchDto,
  GetSavedSearchesQueryDto,
  SavedSearchResponseDto,
  PaginatedSavedSearchResponseDto,
} from './dto/saved_search.dto';

@Controller('saved-searches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  /**
   * POST /saved-searches
   * Create a new saved search
   */
  @Post()
  async createSavedSearch(
    @Req() req: Request,
    @Body() createDto: CreateSavedSearchDto,
  ): Promise<SavedSearchResponseDto> {
    const userId = (req.user as any).id;
    const savedSearch = await this.savedSearchesService.createSavedSearch(
      userId,
      createDto,
    );
    return SavedSearchResponseDto.fromEntity(savedSearch);
  }

  /**
   * GET /saved-searches/mine
   * Get all saved searches for the authenticated user
   */
  @Get('mine')
  async getMySavedSearches(
    @Req() req: Request,
    @Query() query: GetSavedSearchesQueryDto,
  ): Promise<PaginatedSavedSearchResponseDto> {
    const userId = (req.user as any).id;
    const result = await this.savedSearchesService.getUserSavedSearches(
      userId,
      query,
    );
    return PaginatedSavedSearchResponseDto.fromPaginatedResult(result);
  }

  /**
   * GET /saved-searches/:id
   * Get a single saved search by ID
   */
  @Get(':id')
  async getSavedSearchById(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<SavedSearchResponseDto> {
    const userId = (req.user as any).id;
    const savedSearch = await this.savedSearchesService.getSavedSearchById(
      id,
      userId,
    );
    return SavedSearchResponseDto.fromEntity(savedSearch);
  }

  /**
   * DELETE /saved-searches/:id
   * Delete a saved search
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSavedSearch(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<void> {
    const userId = (req.user as any).id;
    await this.savedSearchesService.deleteSavedSearch(id, userId);
  }

  /**
   * GET /saved-searches (Admin only)
   * Get all saved searches (for admin purposes)
   */
  @Get()
  @Roles('admin')
  async getAllSavedSearches(): Promise<SavedSearchResponseDto[]> {
    const searches = await this.savedSearchesService.getAllSavedSearches();
    return SavedSearchResponseDto.fromEntities(searches);
  }
}
