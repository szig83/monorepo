import { FaGoogle } from 'react-icons/fa';
import SignInButton from './SignInButton';

export default function index() {
	return (
		<div className="text-center">
			<SignInButton provider="google">
				<FaGoogle />
				Belépés Google fiókkal
			</SignInButton>
		</div>
	);
}
