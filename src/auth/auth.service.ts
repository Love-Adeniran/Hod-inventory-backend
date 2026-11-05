import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Prisma, type User } from '@prisma/client';
import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthenticatedUser } from './authenticated-user.js';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const SCRYPT_OPTIONS = { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const PASSWORD_KEY_LENGTH = 64;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function derivePasswordKey(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scrypt(password, salt, PASSWORD_KEY_LENGTH, SCRYPT_OPTIONS, (error, key) => {
            if (error) reject(error);
            else resolve(key as Buffer);
        });
    });
}

async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await derivePasswordKey(password, salt);
    return `${salt.toString('hex')}:${key.toString('hex')}`;
}

async function verifyPassword(password: string, storedHash: string | null): Promise<boolean> {
    const [saltHex, keyHex] = storedHash?.split(':') ?? [];
    const validHash = Boolean(
        saltHex && keyHex && /^[0-9a-f]{32}$/i.test(saltHex) && /^[0-9a-f]{128}$/i.test(keyHex),
    );
    const salt = validHash ? Buffer.from(saltHex!, 'hex') : Buffer.alloc(16);
    const expected = validHash ? Buffer.from(keyHex!, 'hex') : Buffer.alloc(PASSWORD_KEY_LENGTH);
    const actual = await derivePasswordKey(password, salt);
    return validHash && timingSafeEqual(actual, expected);
}

function getCredentials(body: unknown): { email: string; password: string; name?: string } {
    if (!isRecord(body)) throw new BadRequestException('Enter your account details');

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
        throw new BadRequestException('Enter a valid email address');
    }
    if (password.length < 8 || password.length > 128) {
        throw new BadRequestException('Password must be between 8 and 128 characters');
    }

    if (body.name === undefined) return { email, password };

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 2 || name.length > 100) {
        throw new BadRequestException('Name must be between 2 and 100 characters');
    }
    return { email, password, name };
}

function toAuthenticatedUser(user: Pick<User, 'id' | 'email' | 'name' | 'username'>): AuthenticatedUser {
    return { id: user.id, email: user.email, name: user.name, username: user.username };
}

@Injectable()
export class AuthService {
    constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

    async signUp(body: unknown): Promise<{ token: string; user: AuthenticatedUser }> {
        const { email, password, name } = getCredentials(body);
        if (!name) throw new BadRequestException('Enter your name');

        const passwordHash = await hashPassword(password);
        let user: User;
        try {
            user = await this.prisma.user.create({
                data: { email, name, passwordHash },
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                throw new ConflictException('An account with this email already exists');
            }
            throw error;
        }

        return { token: await this.createSession(user.id), user: toAuthenticatedUser(user) };
    }

    async signIn(body: unknown): Promise<{ token: string; user: AuthenticatedUser }> {
        const { email, password } = getCredentials(body);
        const user = await this.prisma.user.findUnique({ where: { email } });
        const passwordMatches = await verifyPassword(password, user?.passwordHash ?? null);
        if (!user || !passwordMatches) {
            throw new UnauthorizedException('Email or password is incorrect');
        }

        return { token: await this.createSession(user.id), user: toAuthenticatedUser(user) };
    }

    async validateSession(token: string): Promise<AuthenticatedUser | null> {
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const session = await this.prisma.session.findUnique({
            where: { tokenHash },
            select: {
                expiresAt: true,
                user: { select: { id: true, email: true, name: true, username: true } },
            },
        });

        if (!session) return null;
        if (session.expiresAt <= new Date()) {
            await this.prisma.session.deleteMany({ where: { tokenHash } });
            return null;
        }
        return toAuthenticatedUser(session.user);
    }

    async signOut(token?: string): Promise<void> {
        if (!token) return;
        const tokenHash = createHash('sha256').update(token).digest('hex');
        await this.prisma.session.deleteMany({ where: { tokenHash } });
    }

    private async createSession(userId: number): Promise<string> {
        const token = randomBytes(32).toString('base64url');
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

        await this.prisma.session.deleteMany({ where: { expiresAt: { lte: new Date() } } });
        await this.prisma.session.create({ data: { tokenHash, userId, expiresAt } });
        return token;
    }
}
