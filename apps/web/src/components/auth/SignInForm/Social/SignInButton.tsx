import { type SocialProvider } from '@/lib/auth'
import { capitalizeFirstLetter } from '@repo/utils/common'
import { Button } from '@heroui/react'
import { authClient } from '@/lib/auth/client'

export default function SignInSocialButton({
	children,
	provider,
}: Readonly<{
	children?: React.ReactNode
	provider: SocialProvider
}>) {
	async function handleSignIn(provider: SocialProvider) {
		console.log('handleSignIn', provider)
		await authClient.signIn.social({
			provider: provider,
			callbackURL: '/user-profile',
		})
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
	)
}
