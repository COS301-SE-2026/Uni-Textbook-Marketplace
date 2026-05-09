import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty} from '@nestjs/swagger';

export class VerifyOtpDto {

    @ApiProperty({
        example: 'u12345678@tuks.co.za',
    })
    @IsEmail()
    email!: string;

    @ApiProperty({
        example: '123456',
        minLength: 6,
        maxLength: 6,
    })
    @IsString()
    @Length(6,6)
    code!: string;
} 