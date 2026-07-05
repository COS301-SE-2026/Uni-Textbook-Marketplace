import { Injectable, BadRequestException } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';

@Injectable()
export class AzureService {
    private blobServiceClient: BlobServiceClient;
    private containerName: string;
    private accountName: string;

    constructor() {
        const sasToken = process.env.AZURE_STORAGE_SAS_TOKEN;
        this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'blobpocnexusdev';
        this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'nexusdevimages';

        if(sasToken) {
            this.blobServiceClient = new BlobServiceClient(
                `https://${this.accountName}.blob.core.windows.net?${sasToken}`
            );
        } else {
            throw new Error('Azure storage credentials not configured');
        }

    }

    async uploadImage(file: any): Promise<string> {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if(!allowedMimeTypes.includes(file.mimetype)) {
            throw new BadRequestException('Only image files (JPEG, PNG, WEBP, GIF) are allowed');
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new BadRequestException('File size exceeds 5MB limit');
        }

        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        const timestamp = Date.now();
        const extension = file.originalname.split('.').pop();
        const blobName = `${timestamp}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: {
                blobContentType: file.mimetype,
            },
        });

        return blockBlobClient.url;
    }

    async listBlobs(): Promise<{ name: string; url: string }[]> {
        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        const blobs: { name: string; url: string }[] = [];

        for await (const blob of containerClient.listBlobsFlat()) {
            const blobClient = containerClient.getBlockBlobClient(blob.name);
            blobs.push({
                name: blob.name,
                url: blobClient.url,
            });
        }
        return blobs;
    }

    async deleteImage(imageUrl: string): Promise<void> {
        try {
            const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
            const urlParts = new URL(imageUrl);
            const pathParts = urlParts.pathname.split('/');
            const blobName = pathParts[pathParts.length - 1];

            if (blobName) {
                const blockBlobClient = containerClient.getBlockBlobClient(blobName);
                await blockBlobClient.deleteIfExists();
            }
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    }
}