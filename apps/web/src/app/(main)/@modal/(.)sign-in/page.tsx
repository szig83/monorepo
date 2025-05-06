import SignInForm from '@/components/auth/SignInForm';

export default async function SignInPageIntercept() {
	return <SignInForm isInterceptingModal={true} />;
}
