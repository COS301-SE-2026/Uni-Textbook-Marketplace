import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCaseDto {
  @ApiProperty({
    description: 'The appeal message from the banned user',
    example:
      'I believe I was banned unfairly. I was not aware that selling notes was against the platform rules...',
    minLength: 10,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Appeal message is required' })
  @MinLength(10, {
    message: 'Appeal message must be at least 10 characters long',
  })
  @MaxLength(5000, { message: 'Appeal message cannot exceed 5000 characters' })
  appeal_message!: string;
}
