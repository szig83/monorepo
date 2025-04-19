'use client'

import { authClient } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'

export default function LogoutButton({
	children,
	redirectTo = '/',
}: Readonly<{ children?: React.ReactNode; redirectTo?: string }>) {
	const router = useRouter()

	const handleLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					router.push(redirectTo)
					router.refresh()
				},
			},
		})
	}

	return <div onClick={handleLogout}>{children ?? 'Kilépés'}</div>
}
