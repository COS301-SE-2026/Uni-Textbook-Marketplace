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
  InternalServerErrorException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AzureService } from './azure.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('images')
@UseGuards(JwtAuthGuard)
export class AzureController {

  constructor(private readonly azureService: AzureService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('images', 5))
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const urlUpload: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const urlRes = await this.azureService.uploadImage(file);
      urlUpload.push(urlRes);
    }
    return { urls: urlUpload };
  }

  @Get('list')
  async listImages() {
    return this.azureService.listBlobs();
  }

  @Get('test')
  test() {
    return { status: 'ok', msg: 'azure controller online' };
  }

  @Delete('delete')
  async deleteImage(@Body('url') imageUrl: string) {
    if (!imageUrl) {
      throw new BadRequestException('No image url passed in');
    }

    try {
      await this.azureService.deleteImage(imageUrl);
      return { success: true, message: 'Blob removed' };
    } catch {
      throw new InternalServerErrorException(
        'Failed to remove image from Azure container',
      );
    }
  }
}
