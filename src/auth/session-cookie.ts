export const SESSION_COOKIE_NAME = 'inventory_session';

export function readSessionCookie(cookieHeader?: string): string | undefined {
    const cookie = cookieHeader
        ?.split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));

    return cookie?.slice(SESSION_COOKIE_NAME.length + 1) || undefined;
}

export function createSessionCookie(token: string): string {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secure}`;
}

export function clearSessionCookie(): string {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return `${SESSION_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`;
}
