import {
  CanActivate,
  Injectable,
} from '@nestjs/common';
//may need to include execution context as an import

@Injectable()
export class AuthGuard implements CanActivate{
    canActivate(): boolean{
        return true;
        //Will implement fully in sprint 2
    }
}
