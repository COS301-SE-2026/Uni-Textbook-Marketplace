import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate{
    canActivate(_: ExecutionContext): boolean{
        return true;
        //Will implement fully in sprint 2
    }
}