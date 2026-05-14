import { IsEmail } from "class-validator";
import { ApiProperty} from '@nestjs/swagger';

export class ResendOtpDto {

    @ApiProperty({
        example: 'u12345678@tuks.co.za',
    })
    @IsEmail()
    email!: string;
}