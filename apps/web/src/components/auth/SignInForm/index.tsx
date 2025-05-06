'use client';

import CustomModal from '@/components/CustomModal';
import DividerWithText from '@/components/DividerWithText';
import Link from 'next/link';

import Credential from './Credential';
import Social from './Social';

export default function SignInForm({
	isInterceptingModal,
	isAdminPlace = false,
	redirectTo = '/',
}: Readonly<{
	isInterceptingModal?: boolean;
	isAdminPlace?: boolean;
	redirectTo?: string;
}>) {
	return (
		<CustomModal
			modalTitle="Bejelentkezés"
			modalFooter={
				<div className="text-muted-foreground flex items-center justify-center gap-1 text-xs">
					Nincsen még fiókja?
					<Link href="/sign-up" className="text-primary" scroll={false}>
						Hozzon létre egyet!
					</Link>
				</div>
			}
		>
			<Credential isInterceptingModal={isInterceptingModal} redirectTo={redirectTo} />
			{!isAdminPlace && (
				<>
					<DividerWithText text="vagy" />
					<Social />
				</>
			)}
		</CustomModal>
	);
}
