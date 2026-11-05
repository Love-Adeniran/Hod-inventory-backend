import { db } from "./db.ts";
import { seed } from "./seed.ts";

export { db };

export async function listUsers(limit = 10) {
  await seed();
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      createdAt: true,
    },
    take: limit,
  });

  return users.map((user) => ({
    id: String(user.id),
    email: user.email,
    username: user.username ?? null,
    name: user.name ?? null,
    createdAt: user.createdAt,
  }));
}

export type StarterUser = Awaited<ReturnType<typeof listUsers>>[number];
