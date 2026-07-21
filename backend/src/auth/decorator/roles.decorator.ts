import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export function Roles(role: string): MethodDecorator;
export function Roles(...roles: string[]): MethodDecorator;
export function Roles(...roles: string[]): MethodDecorator {
  
  return SetMetadata(ROLES_KEY, roles);
}
