import { Module } from '@nestjs/common';
import { AzureService } from './azure.service';
import { AzureController } from './azure.controller';

@Module({
  providers: [AzureService],
  controllers: [AzureController],
  exports: [AzureService],
})
export class AzureModule {}
