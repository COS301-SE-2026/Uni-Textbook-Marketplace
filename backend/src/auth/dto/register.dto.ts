import { IsEmail, IsString, MinLength, IsOptional, IsUUID} from 'class-validator';
import { ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';

export class RegisterDto {

    @ApiProperty({
        example: 'u12345678@tuks.co.za',
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: 'password123',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    password!: string;

    @ApiProperty({
        example: 'Gift',
    })
    @IsString()
    first_name!: string;
    
    @ApiProperty({
        example: 'Mohuba',
    })
    @IsString()
    last_name!: string;

    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    university_id!: string;

    @ApiPropertyOptional({
        example: 'Ebit',
    })
    @IsString()
    @IsOptional()
    faculty?: string;

    
}