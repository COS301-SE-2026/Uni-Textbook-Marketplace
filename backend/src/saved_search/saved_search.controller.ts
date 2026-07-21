import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { CurrentUser } from '../auth/decorator/user.decorator';
import { UserId } from '../auth/decorator/user_id.decorator';

import { SavedSearchesService } from './saved_search.service';
import {
  CreateSavedSearchDto,
  GetSavedSearchesQueryDto,
  SavedSearchResponseDto,
  PaginatedSavedSearchResponseDto,
} from './dto/saved_search.dto';
import { User } from '../database/entities/users.entity';

@Controller('saved-searches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  //POST /saved-searches to create a new saved search
  @Post()
  async createSavedSearch(
    @CurrentUser() user: User,
    @Body() createDto: CreateSavedSearchDto,
  ): Promise<SavedSearchResponseDto> {
    const savedSearch = await this.savedSearchesService.createSavedSearch(
      user.id,
      createDto,
    );
    return SavedSearchResponseDto.fromEntity(savedSearch);
  }

  // GET /saved-searches/mine to get all saved searches for the authenticated user
  @Get('mine')
  async getMySavedSearches(
    @UserId() userId: string,
    @Query() query: GetSavedSearchesQueryDto,
  ): Promise<PaginatedSavedSearchResponseDto> {
    const result = await this.savedSearchesService.getUserSavedSearches(
      userId,
      query,
    );
    return PaginatedSavedSearchResponseDto.fromPaginatedResult(result);
  }

  // GET /saved-searches/:id to get a single saved search by ID
  @Get(':id')
  async getSavedSearchById(
    @UserId() userId: string,
    @Param('id') id: string,
  ): Promise<SavedSearchResponseDto> {
    const savedSearch = await this.savedSearchesService.getSavedSearchById(
      id,
      userId,
    );
    return SavedSearchResponseDto.fromEntity(savedSearch);
  }

  //DELETE /saved-searches/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSavedSearch(
    @UserId() userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.savedSearchesService.deleteSavedSearch(id, userId);
  }

  //GET /saved-searches (Admin only)
  @Get()
  @Roles('admin')
  async getAllSavedSearches(): Promise<SavedSearchResponseDto[]> {
    const searches = await this.savedSearchesService.getAllSavedSearches();
    return SavedSearchResponseDto.fromEntities(searches);
  }

  //GET /saved-searches/me
  @Get('me')
  getCurrentUserInfo(@CurrentUser() user: User): {
    id: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  } {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
    };
  }

  //GET /saved-searches/me/email
  @Get('me/email')
  getCurrentUserEmail(@CurrentUser('email') email: string): { email: string } {
    // No 'async' needed
    return { email };
  }

  //GET /saved-searches/me/role
  @Get('me/role')
  getCurrentUserRole(@CurrentUser('role') role: string): { role: string } {
    return { role };
  }
}
