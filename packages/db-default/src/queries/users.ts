import db from '@/database'
import { eq } from 'drizzle-orm'
import { users } from '@/database/schemas'

const usersList = await db.query.users.findMany()

const getUserData = async (id: string) => await db.select().from(users).where(eq(users.id, id))

export { usersList, getUserData }
