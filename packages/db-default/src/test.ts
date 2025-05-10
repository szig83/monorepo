import * as v from 'valibot';
import { type GroupInsertSchema, groupInsertSchema } from './schemas/auth/groups/groups';

const data: GroupInsertSchema = {
	name: { hu: 'test', en: 'a' },
	description: { hu: 'test', en: 'a' },
};

const parsed = v.safeParse(groupInsertSchema, data);
console.log(parsed.issues);
