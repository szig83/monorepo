import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function UserProfilePage() {
	console.log('UserProfilePage');

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	console.log(session);

	return <div>Felhasználó profil oldal</div>;
}
