import { Injectable, BadRequestException } from "@nestjs/common";
import {InjectRepository} from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { MoreThan, Repository } from "typeorm";

import { User } from "./entities/user.entity";
import { Otp } from './entities/otp.entity';

@Injectable()
export class OtpService {

    private readonly MAX_ATTEMPTS = 4;
    private readonly OTP_MINUTES = 10;

    constructor(

        @InjectRepository(User)
        private readonly userRespository: Repository<User>,

        @InjectRepository(Otp)
        private readonly otpRepository: Repository<Otp>,
    ) {}

    async createOtp(email: string): Promise<string> {

        await this.otpRepository.update(
            {
                email,
                used: false, 
            },
            {
                used: true,
            },
        );

        const code = crypto.randomInt(100000,999999).toString();

        const otp = this.otpRepository.create({
            email,
            code,
            expires_at: new Date(
                Date.now() + this.OTP_MINUTES * 60 * 1000
            ),
        });

        await this.otpRepository.save(otp);

        return code;
    }

    async verifyOtp(email: string, submittedCode: string): Promise<void> {

        const otp = await this.otpRepository.findOne({
           where: {
                email, 
                used: false,
                expires_at: MoreThan(new Date()),
            },
            order: {
                created_at: 'DESC',
            },
        });


        if(!otp){
            throw new BadRequestException('No valid OTP found. Please request a new one.')
        }

        await this.otpRepository.increment(
            {id: otp.id },
            'attempts',
            1,
        );

        if(otp.attempts + 1 >= this.MAX_ATTEMPTS){

            await this.otpRepository.update(
                {id: otp.id},
                {used: true},
            );

            throw new BadRequestException('Too many failed attempts. Please request a new OTP.')

        }

        const isValid = crypto.timingSafeEqual(
            Buffer.from(otp.code), 
            Buffer.from(submittedCode),
        );

        if(!isValid){
            throw new BadRequestException('Invalid OTP code.');
        }

        await this.otpRepository.update(
            { id: otp.id },
            { used: true },
        );
    }

    async canRequestOtp(email: string): Promise<void> {

        const existingOtp = await this.otpRepository.findOne({
            where: {
                email,
                used: false,
            },
            order: {
                created_at: 'DESC',
            },
        });

        if (!existingOtp) {
            
            throw new BadRequestException(
                'An OTP has already been sent. Please wait before requesting another one.',
            );
        }

    }
}