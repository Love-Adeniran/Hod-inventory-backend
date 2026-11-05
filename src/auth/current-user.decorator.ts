import { createParamDecorator } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from './authenticated-user.js';

export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext): AuthenticatedUser =>
        context.switchToHttp().getRequest<{ user: AuthenticatedUser }>().user,
);
