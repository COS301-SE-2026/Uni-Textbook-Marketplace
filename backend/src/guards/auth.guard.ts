import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate{
    canActivate(_: ExecutionContext): boolean{
        return true;
        //Will implement fully in sprint 2
    }
}