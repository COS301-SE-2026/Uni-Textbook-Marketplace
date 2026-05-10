import { Injectable, BadRequestException } from "@nestjs/common";
import {InjectRepository} from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { Repository } from "typeorm";

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

}