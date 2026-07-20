import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateConversationDto {
    @ApiProperty({
        description: 'The UUID of the listing the buyer wants to message about.',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    listingId: string;
}