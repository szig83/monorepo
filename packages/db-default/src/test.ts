import * as v from 'valibot'
import { groups, groupSchema, type GroupSchema } from './schemas/auth/groups/groups'

const parsed: GroupSchema = v.parse(groupSchema, { name: { hu: 'test' } })
console.log(parsed)
