import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateConversationDto {
  @ApiProperty({
    description: 'UUID of the conversation \n',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  listingId: string;
}
