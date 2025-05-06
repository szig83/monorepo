import type { SocialProvider } from '@/lib/auth';
import { authClient } from '@/lib/auth/client';
import { Button } from '@heroui/react';
import { capitalizeFirstLetter } from '@repo/utils/common';

export default function SignInSocialButton({
	children,
	provider,
}: Readonly<{
	children?: React.ReactNode;
	provider: SocialProvider;
}>) {
	async function handleSignIn(provider: SocialProvider) {
		console.log('handleSignIn', provider);
		await authClient.signIn.social({
			provider: provider,
			callbackURL: '/user-profile',
		});
	}

	return (
		<Button
			variant="light"
			type="button"
			onPress={() => handleSignIn(provider)}
			color="primary"
			size="sm"
		>
			{children ?? `Belépés ${capitalizeFirstLetter(provider)} fiókkal`}
		</Button>
	);
}
