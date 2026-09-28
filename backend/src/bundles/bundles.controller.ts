import {
    Body,
    Controller,
    Post,
    UseGuards,
} from '@nestjs/common';
import { BundlesService } from './bundles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface OptimizeBundleDto {
    moduleIds: string[];
}

@Controller('bundles')
export class BundlesController {
    constructor(
        private readonly bundlesService: BundlesService,
    ) {}

    @Post('optimize')
    @UseGuards(JwtAuthGuard)
    async optimize(@Body() body: OptimizeBundleDto) {
        return this.bundlesService.optimizeBundle(body.moduleIds);
    }
}