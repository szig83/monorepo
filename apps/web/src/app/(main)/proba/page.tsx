import { auth } from '@/lib/auth'

export default async function PageTeszt() {
	return (
		<>
			<form
				action={async () => {
					'use server'
					const result = await auth.api.signUpEmail({
						body: {
							email: 'test@example.com',
							password: 'password1234',
							name: 'Próba Felhasználó',
						},
					})
					console.log(result)
				}}
			>
				PageTeszt<button type="submit">katt</button>
			</form>
			<div className={'bg-red-100 px-3 text-2xl'}></div>
		</>
	)
}
