import Link from 'next/link'
import { Providers } from './providers'
import UserAuthControl from '@/components/auth/UserAuthControl'

export default async function MainLayout({
	modal,
	children,
}: {
	modal: React.ReactNode
	children: React.ReactNode
}) {
	return (
		<Providers>
			<div className="flex h-screen flex-col">
				<header className="flex min-h-[3rem] items-center justify-between bg-stone-800 px-7 py-2 text-stone-300">
					<div className="flex items-center gap-3">
						<Link href="/">Kezdőlap</Link>
						<Link href="/proba">Próba</Link>
					</div>
					<UserAuthControl />
				</header>
				<div className="flex grow p-2">{children}</div>
				{modal}
			</div>
		</Providers>
	)
}
