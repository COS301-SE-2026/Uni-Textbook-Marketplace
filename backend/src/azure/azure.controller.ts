import {
    Controller,
    Post,
    Get,
    Delete,
    UseGuards,
    UseInterceptors,
    UploadedFiles,
    BadRequestException,
    Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AzureService } from './azure.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';


@Controller('images')
@UseGuards(JwtAuthGuard)
export class AzureController {
    constructor(private readonly azureService: AzureService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('images', 5))
    async uploadImage(@UploadedFiles() files: any[]) {
        if(!files || files.length === 0) {
            throw new BadRequestException('No files uploaded');
        }
        const urls: string[] = [];

        for (const file of files) {
            const url = await this.azureService.uploadImage(file);
            urls.push(url);
        }
        return { urls };
    }

    @Get('list')
    async listImages() {
        return this.azureService.listBlobs();
    }

    @Delete('delete')
    async deleteImage(@Body('url') url: string) {
        await this.azureService.deleteImage(url);
        return { message: 'Image deleted successfully' };
    }
}