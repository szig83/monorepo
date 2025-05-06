import db from '@/database';
import { users } from '@/database/schemas';
import { eq } from 'drizzle-orm';

const usersList = await db.query.users.findMany();

const getUserData = async (id: string) => await db.select().from(users).where(eq(users.id, id));

export { usersList, getUserData };
