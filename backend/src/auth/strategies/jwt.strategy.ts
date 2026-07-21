import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/users.entity';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

interface RequestWithCookies extends Request {
  cookies: {
    access_token?: string;
  };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    
    const jwtSecret = config.get<string>('JWT_ACCESS_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([

        ExtractJwt.fromAuthHeaderAsBearerToken(),
      
        (req: RequestWithCookies) => {
          return req.cookies?.access_token ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret || 'test-secret-key', 
    });
  }

  async validate(payload: JwtPayload) {
    
    const user = await this.usersRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role || 'student',
    };
  }
}
