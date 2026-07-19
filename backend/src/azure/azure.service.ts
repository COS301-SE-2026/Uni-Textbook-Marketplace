import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import { randomUUID } from 'crypto';

@Injectable()
export class AzureService {


  private readonly blobServiceClient: BlobServiceClient;
  private readonly containerName: string;
  private readonly accountName: string;

  constructor() {

    const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;


    this.accountName =
      process.env.AZURE_STORAGE_ACCOUNT_NAME || 'blobpocnexusdev';

    this.containerName =
      process.env.AZURE_STORAGE_CONTAINER_NAME || 'nexusdevimages';

      if (!sasToken) {
        throw new Error('Azure SAS Token is missing from .env');
      }

      this.blobServiceClient = new BlobServiceClient(
        `https://${this.accountName}.blob.core.windows.net?${sasToken}`,
      );

  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const correctMIMETypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!correctMIMETypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only correct image files (JPEG, PNG, WEBP, GIF) are accepted'
      );
    }

    const highestBytes = 5 * 1024 * 1024;

    if (file.size > highestBytes) {
      throw new BadRequestException('File size exceeds 5MB');
    }

    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName
    );
    const extSections = file.originalname.split('.');
    const fileExtens = extSections.length > 1 ? extSections[extSections.length - 1] : 'png';

    const blobContName = `${randomUUID()}.${fileExtens}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobContName);
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype,
      },
    });

    return blockBlobClient.url;
  }

  async listBlobs(): Promise<{ name: string; url: string }[]> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blobGroupList: { name: string; url: string }[] = [];

    for await (const blob of containerClient.listBlobsFlat()) {
      const blobClient = containerClient.getBlockBlobClient(blob.name);
      blobGroupList.push({
        name: blob.name,
        url: blobClient.url,
      });
    }
    return blobGroupList;
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl) return;

    try {
      const containerClient = this.blobServiceClient.getContainerClient(
        this.containerName
      );
      const urlRead = new URL(imageUrl);
      const pathUrls = urlRead.pathname.split('/');
      const specificBlob = pathUrls[pathUrls.length - 1];

      if (!specificBlob) {
        throw new BadRequestException('Couldnt find blob path');

      }
      const blockBlobClient = containerClient.getBlockBlobClient(specificBlob);
      await blockBlobClient.deleteIfExists();
    } catch {
      throw new InternalServerErrorException(
        'Azure operation failed during removal'
      );
    }
  }
}
