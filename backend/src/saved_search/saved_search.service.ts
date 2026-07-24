import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, In, DataSource } from 'typeorm';

import { SavedSearch } from '../database/entities/saved_search.entity';
import { User } from '../database/entities/users.entity';
import { Listing } from '../database/entities/listing.entity';
import { Book } from '../database/entities/book.entity';
import { Module as ModuleEntity } from '../database/entities/module.entity';

import {
  CreateSavedSearchDto,
  GetSavedSearchesQueryDto,
  SavedSearchFiltersDto,
} from './dto/saved_search.dto';

@Injectable()
export class SavedSearchesService {
  private savedSearchRepository: Repository<SavedSearch>;
  private userRepository: Repository<User>;
  private listingRepository: Repository<Listing>;
  private bookRepository: Repository<Book>;
  private moduleRepository: Repository<ModuleEntity>;

  constructor(private dataSource: DataSource) {
    this.savedSearchRepository = this.dataSource.getRepository(SavedSearch);
    this.userRepository = this.dataSource.getRepository(User);
    this.listingRepository = this.dataSource.getRepository(Listing);
    this.bookRepository = this.dataSource.getRepository(Book);
    this.moduleRepository = this.dataSource.getRepository(ModuleEntity);
  }

  private toNumber(value: string | number | undefined | null): number | null {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private isString(value: unknown): value is string {
    return typeof value === 'string';
  }

  // Create a new saved search for a user
  async createSavedSearch(
    userId: string,
    data: CreateSavedSearchDto,
  ): Promise<SavedSearch> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const validation = this.validateFilter(data.filter_json);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors);
    }

    const savedSearch = this.savedSearchRepository.create({
      user_id: userId,
      filter_json: data.filter_json as Record<string, any>,
    });

    return await this.savedSearchRepository.save(savedSearch);
  }

  // Get all saved searches for a user with pagination
  async getUserSavedSearches(
    userId: string,
    query: GetSavedSearchesQueryDto,
  ): Promise<{
    data: SavedSearch[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20 } = query;

    const [data, total] = await this.savedSearchRepository.findAndCount({
      where: { user_id: userId },
      order: {
        created_at: 'DESC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Delete a saved search by ID
  async deleteSavedSearch(id: string, userId: string): Promise<void> {
    const savedSearch = await this.savedSearchRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!savedSearch) {
      throw new NotFoundException(
        'Saved search not found or does not belong to user',
      );
    }

    await this.savedSearchRepository.delete(id);
  }

  // Get a single saved search by ID
  async getSavedSearchById(id: string, userId: string): Promise<SavedSearch> {
    const savedSearch = await this.savedSearchRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!savedSearch) {
      throw new NotFoundException('Saved search not found');
    }

    return savedSearch;
  }

  // Check if a listing matches a saved search filter
  matchesFilter(listing: Listing, filter: SavedSearchFiltersDto): boolean {
    // Module filter (by module code)
    if (filter.moduleCode && listing.module?.code !== filter.moduleCode) {
      return false;
    }

    // Faculty filter
    if (filter.faculty && listing.module?.faculty?.name) {
      const facultyMatch = listing.module.faculty.name
        .toLowerCase()
        .includes(filter.faculty.toLowerCase());
      if (!facultyMatch) return false;
    }

    // Edition filter
    if (filter.edition && listing.book?.edition) {
      const editionMatch = String(listing.book.edition) === filter.edition;
      if (!editionMatch) return false;
    }

    // Price range filter
    const priceMin = this.toNumber(filter.priceMin);
    const priceMax = this.toNumber(filter.priceMax);

    if (priceMin !== null && listing.price < priceMin) {
      return false;
    }
    if (priceMax !== null && listing.price > priceMax) {
      return false;
    }

    // Condition filter
    if (filter.condition && listing.condition !== filter.condition) {
      return false;
    }

    // Annotation level filter
    if (
      filter.annotationLevel &&
      listing.annotation_level !== filter.annotationLevel
    ) {
      return false;
    }

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesSearch =
        (listing.title && listing.title.toLowerCase().includes(searchLower)) ||
        (listing.book?.title &&
          listing.book.title.toLowerCase().includes(searchLower)) ||
        (listing.book?.author &&
          listing.book.author.toLowerCase().includes(searchLower)) ||
        (listing.book?.isbn &&
          listing.book.isbn.toLowerCase().includes(searchLower)) ||
        (listing.module?.code &&
          listing.module.code.toLowerCase().includes(searchLower));

      if (!matchesSearch) return false;
    }

    return true;
  }

  // Find all users with saved searches that match a new listing
  async findMatchingSavedSearches(listingId: string): Promise<
    Array<{
      userId: string;
      savedSearchId: string;
      filter: SavedSearchFiltersDto;
    }>
  > {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
      relations: ['book', 'module', 'module.university', 'module.faculty'],
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    const allSearches = await this.savedSearchRepository.find();

    const matches: Array<{
      userId: string;
      savedSearchId: string;
      filter: SavedSearchFiltersDto;
    }> = [];

    for (const search of allSearches) {
      const filter = search.filter_json as SavedSearchFiltersDto;

      if (this.matchesFilter(listing, filter)) {
        matches.push({
          userId: search.user_id,
          savedSearchId: search.id,
          filter: filter,
        });
      }
    }

    return matches;
  }

  // Validate filter structure
  private validateFilter(filter: SavedSearchFiltersDto): {
    valid: boolean;
    errors?: string[];
  } {
    const errors: string[] = [];

    // Check priceMin
    if (
      filter.priceMin !== undefined &&
      filter.priceMin !== null &&
      filter.priceMin !== ''
    ) {
      const num = this.toNumber(filter.priceMin);
      if (num === null || num < 0) {
        errors.push('priceMin must be a valid number >= 0');
      }
    }

    // Check priceMax
    if (
      filter.priceMax !== undefined &&
      filter.priceMax !== null &&
      filter.priceMax !== ''
    ) {
      const num = this.toNumber(filter.priceMax);
      if (num === null || num < 0) {
        errors.push('priceMax must be a valid number >= 0');
      }
    }

    // Check price range logic
    const priceMinNum = this.toNumber(filter.priceMin);
    const priceMaxNum = this.toNumber(filter.priceMax);
    if (
      priceMinNum !== null &&
      priceMaxNum !== null &&
      priceMinNum > priceMaxNum
    ) {
      errors.push('priceMin cannot be greater than priceMax');
    }

    // Check condition
    if (
      filter.condition !== undefined &&
      filter.condition !== null &&
      filter.condition !== ''
    ) {
      if (!this.isString(filter.condition)) {
        errors.push('condition must be a string');
      } else if (!['new', 'good', 'fair', 'poor'].includes(filter.condition)) {
        errors.push('condition must be one of: new, good, fair, poor');
      }
    }

    // Check annotationLevel
    if (
      filter.annotationLevel !== undefined &&
      filter.annotationLevel !== null &&
      filter.annotationLevel !== ''
    ) {
      if (!this.isString(filter.annotationLevel)) {
        errors.push('annotationLevel must be a string');
      } else if (!['none', 'light', 'heavy'].includes(filter.annotationLevel)) {
        errors.push('annotationLevel must be one of: none, light, heavy');
      }
    }

    // Check moduleCode
    if (
      filter.moduleCode !== undefined &&
      filter.moduleCode !== null &&
      filter.moduleCode !== ''
    ) {
      if (!this.isString(filter.moduleCode)) {
        errors.push('moduleCode must be a string');
      }
    }

    // Check faculty
    if (
      filter.faculty !== undefined &&
      filter.faculty !== null &&
      filter.faculty !== ''
    ) {
      if (!this.isString(filter.faculty)) {
        errors.push('faculty must be a string');
      }
    }

    // Check edition
    if (
      filter.edition !== undefined &&
      filter.edition !== null &&
      filter.edition !== ''
    ) {
      if (!this.isString(filter.edition)) {
        errors.push('edition must be a string');
      }
    }

    // Check search
    if (
      filter.search !== undefined &&
      filter.search !== null &&
      filter.search !== ''
    ) {
      if (!this.isString(filter.search)) {
        errors.push('search must be a string');
      }
    }

    // Check modules array
    if (filter.modules !== undefined && filter.modules !== null) {
      if (!Array.isArray(filter.modules)) {
        errors.push('modules must be an array');
      } else {
        for (let i = 0; i < filter.modules.length; i++) {
          if (!this.isString(filter.modules[i])) {
            errors.push(`modules[${i}] must be a string`);
            break;
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // Get all saved searches
  async getAllSavedSearches(): Promise<SavedSearch[]> {
    return await this.savedSearchRepository.find();
  }

  // Get saved searches by user IDs
  async getSavedSearchesByUserIds(userIds: string[]): Promise<SavedSearch[]> {
    return await this.savedSearchRepository.find({
      where: { user_id: In(userIds) },
    });
  }
}
