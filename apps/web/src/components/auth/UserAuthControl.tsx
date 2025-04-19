/**
 * @TODO Ebbe a komponensbe kerülne a LoginButton komponens, majd belépés után a felhasználó képe, neve és a SignOutButton.
 */

import LoginButton from '@/components/auth/LoginButton'
import UserDropdown from '@/components/auth/UserDropdown'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function UserAuthControl() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	return (
		<div>
			{session?.user ? (
				<div className="flex items-center gap-2 text-sm">
					<UserDropdown
						userFullName={session?.user?.name ?? ''}
						userImage={session?.user?.image ?? ''}
					/>
				</div>
			) : (
				<LoginButton />
			)}
		</div>
	)
}
