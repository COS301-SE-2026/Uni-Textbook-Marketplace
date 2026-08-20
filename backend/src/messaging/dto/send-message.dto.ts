import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'The text content of the message.',
    example: 'Hi! Is this textbook still available?',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  text: string;
}
