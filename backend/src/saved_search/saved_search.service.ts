import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { SavedSearch } from '../database/entities/saved_search.entity';
import { User } from '../database/entities/users.entity';
import { Listing } from '../database/entities/listing.entity';
import { Book } from '../database/entities/book.entity';
import { Module } from '../database/entities/module.entity';

import {
  CreateSavedSearchDto,
  GetSavedSearchesQueryDto,
  SavedSearchFiltersDto,
} from './dto/saved_search.dto';

@Injectable()
export class SavedSearchesService {
  constructor(
    @InjectRepository(SavedSearch)
    private savedSearchRepository: Repository<SavedSearch>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Listing)
    private listingRepository: Repository<Listing>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
  ) {}

  //Create a new saved search for a user
  async createSavedSearch(
    userId: string,
    data: CreateSavedSearchDto,
  ): Promise<SavedSearch> {
    // Validate user exists
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate filter structure
    const validation = this.validateFilter(data.filter_json);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors);
    }

    // Create the saved search
    const savedSearch = this.savedSearchRepository.create({
      user_id: userId,
      filter_json: data.filter_json,
    });

    return await this.savedSearchRepository.save(savedSearch);
  }

  //Get all saved searches for a user with pagination
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

  //Delete a saved search by ID
  async deleteSavedSearch(id: string, userId: string): Promise<void> {
    // Find the saved search and ensure it belongs to the user
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

  //Get a single saved search by ID (with ownership check)
  async getSavedSearchById(id: string, userId: string): Promise<SavedSearch> {
    const savedSearch = await this.savedSearchRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!savedSearch) {
      throw new NotFoundException('Saved search not found');
    }

    return savedSearch;
  }

  //Check if a listing matches a saved search filter
  matchesFilter(listing: Listing, filter: SavedSearchFiltersDto): boolean {
    // Module filter (by module code)
    if (filter.module && listing.module?.code !== filter.module) {
      return false;
    }

    // Book title filter (case-insensitive partial match)
    if (filter.book_title && listing.book?.title) {
      const titleMatch = listing.book.title
        .toLowerCase()
        .includes(filter.book_title.toLowerCase());
      if (!titleMatch) return false;
    }

    // Author filter (case-insensitive partial match)
    if (filter.author && listing.book?.author) {
      const authorMatch = listing.book.author
        .toLowerCase()
        .includes(filter.author.toLowerCase());
      if (!authorMatch) return false;
    }

    // ISBN filter (exact match)
    if (filter.isbn && listing.book?.isbn !== filter.isbn) {
      return false;
    }

    // Price range filter
    if (filter.price_min !== undefined && listing.price < filter.price_min) {
      return false;
    }
    if (filter.price_max !== undefined && listing.price > filter.price_max) {
      return false;
    }

    // Condition filter
    if (filter.condition && listing.condition !== filter.condition) {
      return false;
    }

    // Annotation level filter
    if (
      filter.annotation_level &&
      listing.annotation_level !== filter.annotation_level
    ) {
      return false;
    }

    // Module list filter (listing must be in one of the modules)
    if (filter.modules && filter.modules.length > 0) {
      if (!listing.module || !filter.modules.includes(listing.module.code)) {
        return false;
      }
    }

    // University filter (through module)
    if (filter.university_id) {
      if (listing.module?.university?.id !== filter.university_id) {
        return false;
      }
    }

    // Faculty filter (through module)
    if (filter.faculty_id) {
      if (listing.module?.faculty?.id !== filter.faculty_id) {
        return false;
      }
    }

    return true;
  }

  //Find all users with saved searches that match a new listing
  async findMatchingSavedSearches(listingId: string): Promise<
    Array<{
      userId: string;
      savedSearchId: string;
      filter: SavedSearchFiltersDto;
    }>
  > {
    // Load the listing with all relations needed for matching
    const listing = await this.listingRepository.findOne({
      where: { id: listingId },
      relations: ['book', 'module', 'module.university', 'module.faculty'],
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Get all saved searches
    const allSearches = await this.savedSearchRepository.find();

    const matches: Array<{
      userId: string;
      savedSearchId: string;
      filter: SavedSearchFiltersDto;
    }> = [];

    for (const search of allSearches) {
      const filter = search.filter_json as SavedSearchFiltersDto;

      // Check if the listing matches this saved search
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

  //Get all saved searches (for admins)
  async getAllSavedSearches(): Promise<SavedSearch[]> {
    return await this.savedSearchRepository.find();
  }

  //Get saved searches by user IDs
  async getSavedSearchesByUserIds(userIds: string[]): Promise<SavedSearch[]> {
    return await this.savedSearchRepository.find({
      where: { user_id: In(userIds) },
    });
  }

  //Validate filter structure
  private validateFilter(filter: Record<string, any>): {
    valid: boolean;
    errors?: string[];
  } {
    const errors: string[] = [];

    const isString = (value: any): value is string => typeof value === 'string';
    const isNumber = (value: any): value is number => typeof value === 'number';

    // Check price range
    if (filter.price_min !== undefined) {
      if (!isNumber(filter.price_min)) {
        errors.push('price_min must be a number');
      }
    }

    if (filter.price_max !== undefined) {
      if (!isNumber(filter.price_max)) {
        errors.push('price_max must be a number');
      }
    }

    if (
      filter.price_min !== undefined &&
      filter.price_max !== undefined &&
      isNumber(filter.price_min) &&
      isNumber(filter.price_max) &&
      filter.price_min > filter.price_max
    ) {
      errors.push('price_min cannot be greater than price_max');
    }

    // Check condition
    if (filter.condition !== undefined) {
      if (!isString(filter.condition)) {
        errors.push('condition must be a string');
      } else if (!['new', 'good', 'fair', 'poor'].includes(filter.condition)) {
        errors.push('condition must be one of: new, good, fair, poor');
      }
    }

    // Check annotation_level
    if (filter.annotation_level !== undefined) {
      if (!isString(filter.annotation_level)) {
        errors.push('annotation_level must be a string');
      } else if (
        !['none', 'light', 'heavy'].includes(filter.annotation_level)
      ) {
        errors.push('annotation_level must be one of: none, light, heavy');
      }
    }

    // Check modules array
    if (filter.modules !== undefined) {
      if (!Array.isArray(filter.modules)) {
        errors.push('modules must be an array');
      } else {
        for (let i = 0; i < filter.modules.length; i++) {
          if (!isString(filter.modules[i])) {
            errors.push(`modules[${i}] must be a string`);
            break;
          }
        }
      }
    }

    // Check UUID fields
    if (filter.university_id !== undefined && !isString(filter.university_id)) {
      errors.push('university_id must be a string');
    }
    if (filter.faculty_id !== undefined && !isString(filter.faculty_id)) {
      errors.push('faculty_id must be a string');
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
