export const SESSION_COOKIE_NAME = 'inventory_session';

function getSessionCookieAttributes(): string {
    return process.env.NODE_ENV === 'production'
        ? '; HttpOnly; SameSite=None; Secure; Path=/'
        : '; HttpOnly; SameSite=Strict; Path=/';
}

export function readSessionCookie(cookieHeader?: string): string | undefined {
    const cookie = cookieHeader
        ?.split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));

    return cookie?.slice(SESSION_COOKIE_NAME.length + 1) || undefined;
}

export function createSessionCookie(token: string): string {
    return `${SESSION_COOKIE_NAME}=${token}${getSessionCookieAttributes()}; Max-Age=604800`;
}

export function clearSessionCookie(): string {
    return `${SESSION_COOKIE_NAME}=${getSessionCookieAttributes()}; Max-Age=0`;
}
