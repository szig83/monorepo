'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LoginButton() {
	const pathname = usePathname();
	const isSignInPage = pathname === '/sign-in';

	return (
		<>
			{!isSignInPage && (
				<Link href="/sign-in" scroll={false}>
					Bejelentkezés
				</Link>
			)}
		</>
	);
}
