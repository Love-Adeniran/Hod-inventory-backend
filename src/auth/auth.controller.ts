import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from './authenticated-user.js';
import { CurrentUser } from './current-user.decorator.js';
import { AuthService } from './auth.service.js';
import { SessionAuthGuard } from './session-auth.guard.js';
import {
    clearSessionCookie,
    createSessionCookie,
    readSessionCookie,
} from './session-cookie.js';

interface CookieRequest {
    headers: { cookie?: string };
}

interface CookieResponse {
    setHeader(name: string, value: string): void;
}

@Controller('auth')
export class AuthController {
    constructor(@Inject(AuthService) private readonly authService: AuthService) {}

    @Post('signup')
    async signUp(
        @Body() body: unknown,
        @Res({ passthrough: true }) response: CookieResponse,
    ): Promise<{ user: AuthenticatedUser }> {
        const result = await this.authService.signUp(body);
        response.setHeader('Set-Cookie', createSessionCookie(result.token));
        return { user: result.user };
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Body() body: unknown,
        @Res({ passthrough: true }) response: CookieResponse,
    ): Promise<{ user: AuthenticatedUser }> {
        const result = await this.authService.signIn(body);
        response.setHeader('Set-Cookie', createSessionCookie(result.token));
        return { user: result.user };
    }

    @Post('signout')
    @HttpCode(HttpStatus.NO_CONTENT)
    async signOut(
        @Req() request: CookieRequest,
        @Res({ passthrough: true }) response: CookieResponse,
    ): Promise<void> {
        await this.authService.signOut(readSessionCookie(request.headers.cookie));
        response.setHeader('Set-Cookie', clearSessionCookie());
    }

    @Get('me')
    @UseGuards(SessionAuthGuard)
    getCurrentUser(@CurrentUser() user: AuthenticatedUser): { user: AuthenticatedUser } {
        return { user };
    }
}
