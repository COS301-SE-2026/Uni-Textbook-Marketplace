import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate{
    canActivate(): boolean{
        return true;
        //Will implement fully in sprint 2
    }
}