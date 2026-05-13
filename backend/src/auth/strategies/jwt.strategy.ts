import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(config: ConfigService) {
    super({
      
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
            const token = req?.cookies?.access_token;
            if (!token) return null;
                return token;
            }
      ]),
      ignoreExpiration: false,  
      secretOrKey: config.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}