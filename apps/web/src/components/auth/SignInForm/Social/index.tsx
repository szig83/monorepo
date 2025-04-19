import SignInButton from './SignInButton'
import { FaGoogle } from 'react-icons/fa'

export default function index() {
	return (
		<div className="text-center">
			<SignInButton provider="google">
				<FaGoogle />
				Belépés Google fiókkal
			</SignInButton>
		</div>
	)
}
