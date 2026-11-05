export interface AuthenticatedUser {
    id: number;
    email: string;
    name: string | null;
    username: string | null;
}
