import {
    Controller,
    Post,
    Get,
    Delete,
    UseGuards,
    UseInterceptors,
    UploadedFile,
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
    @UseInterceptors(FileInterceptor('images'))
    async uploadImage(@UploadedFile() file: any) {
        if(!file) {
            throw new BadRequestException('No files uploaded');
        }
        const url = await this.azureService.uploadImage(file);
        return { url };
    }

    @Get('list')
    async listImages() {
        return this.azureService.listBlobs();
    }

    @Get('test')
    async test() {
        return { message: 'Test endpoint is working' };
    }

    @Delete('delete')
    async deleteImage(@Body('url') url: string) {
        await this.azureService.deleteImage(url);
        return { message: 'Image deleted successfully' };
    }
}