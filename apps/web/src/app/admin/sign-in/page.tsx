import LoginForm from '@/components/auth/SignInForm'
import { ADMIN_ROUTES } from '@/lib/routes'

export default function AdminSignInPage() {
	return (
		<>
			<div className="flex h-screen w-full flex-col items-center justify-center">
				<div className="w-full max-w-xs rounded-lg p-3 shadow-xl">
					<h2 className="mb-4 text-center text-2xl font-bold">Bejelentkezés</h2>
					<LoginForm isAdminPlace={true} redirectTo={ADMIN_ROUTES.root} />
				</div>
			</div>
		</>
	)
}
