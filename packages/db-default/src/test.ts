import * as v from 'valibot';
import { type GroupSchema, groupSchema, groups } from './schemas/auth/groups/groups';

const parsed: GroupSchema = v.parse(groupSchema, { name: { hu: 'test' } });
console.log(parsed);
