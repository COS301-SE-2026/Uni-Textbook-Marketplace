import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export function Roles(role: string): MethodDecorator;
export function Roles(...roles: string[]): MethodDecorator;
export function Roles(...roles: string[]): MethodDecorator {
  // Store as array internally (supports both cases)
  return SetMetadata(ROLES_KEY, roles);
}
