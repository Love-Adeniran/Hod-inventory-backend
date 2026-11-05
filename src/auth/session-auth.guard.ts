import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from './authenticated-user.js';
import { AuthService } from './auth.service.js';
import { readSessionCookie } from './session-cookie.js';

interface SessionRequest {
    headers: { cookie?: string };
    user?: AuthenticatedUser;
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
    constructor(@Inject(AuthService) private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<SessionRequest>();
        const token = readSessionCookie(request.headers.cookie);
        if (!token) throw new UnauthorizedException('Sign in to continue');

        const user = await this.authService.validateSession(token);
        if (!user) throw new UnauthorizedException('Your session has expired. Sign in again');

        request.user = user;
        return true;
    }
}
