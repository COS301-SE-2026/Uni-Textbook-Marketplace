import { Injectable,BadRequestException, UnauthorizedException, ConflictException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import {ConfigService} from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { OtpService } from './otp.service';
import { IEmailService } from '../email/email.interface';

import { User } from "./entities/user.entity";
import { University } from "./entities/university.entity";
import { sign } from "crypto";

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

        private readonly emailService: IEmailService,
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

        const password_hash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

        const user = this.userRepository.create({
            email: dto.email,
            password_hash,
            first_name: dto.first_name,
            last_name: dto.last_name,
            university_id: dto.university_id,
            faculty: dto.faculty ?? null,
        });
        await this.userRepository.save(user)

        const otp = await this.otpService.createOtp(dto.email);
        await this.emailService.sendOtp(dto.email, otp);

        return {
            message: 'Registration successful. Check your university email for verification code'
        };
    }

    async verifyEmail(email: string, code: string) {

        await this.otpService.verifyOtp(email,code);

        await this.userRepository.update(
            {
                email
            },
            {
                is_verified: true,
                updated_at: new Date(),
            },
        );

        const userResult = await this.userRepository.findOne({
            select : {
                id: true,
                email: true,
                role: true,
            },
            where : {
                email: email,
            },
        });

        if (!userResult) {
            throw new UnauthorizedException('User not found');
        }

        const user = userResult;

        return this.issueTokens(user);
    }

    private issueTokens(user: { id: string; email: string; role: string}){
      
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role
        };

        const accessToken = this.jwtService.sign(
            
            payload, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }
            
        );

        const refreshToken = this.jwtService.sign(
            
            payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }
            
        );

        return { accessToken, refreshToken };
    }
}