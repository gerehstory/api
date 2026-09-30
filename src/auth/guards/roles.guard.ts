import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleEnum } from '../../users/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // get roles in metadata
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getClass(), context.getHandler()],
    );

    if (!requiredRoles) return true;

    // get user data from jwt token
    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) throw new ForbiddenException();

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) throw new ForbiddenException();

    return true;
  }
}
