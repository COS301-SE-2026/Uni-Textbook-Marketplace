import { IsEmail, IsString, MinLength} from 'class-validator';
import { ApiProperty} from '@nestjs/swagger';

export class LoginDto {

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
   
}