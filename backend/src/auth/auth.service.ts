import { Injectable,BadRequestException, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { OtpService } from './otp.service';
import { IEmailService } from './email/email.interface';

import { User } from "./entities/user.entity";
import { University } from "./entities/university.entity";

@Injectable()
export class AuthService{
    
    private readonly BCRYPT_ROUNDS = 12;

    constructor(

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(University)
        private readonly universityRepository: Repository<University>,


        private readonly otpService: OtpService,

        private readonly jwtService: JwtService,

        private readonly configService: ConfigService,

        private readonly emailService: EmailService,
    ) {}

    async register(dto: RegisterDto){

        const uniResult = await this.universityRepository.findOne({
            select: {
                id: true,
                email_domain: true,
            },
            where: {
                id: dto.university_id,
            },
        });

        if(!uniResult){
           throw new BadRequestException('Selected university is not valid'); 
        }


        const emailDomain = dto.email.split('@')[1].toLocaleLowerCase();

        if (emailDomain !== uniResult.email_domain.toLocaleLowerCase()){
            throw new BadRequestException(`Your email must be a ${uniResult.email_domain} address for this university`);
        }
    }
}