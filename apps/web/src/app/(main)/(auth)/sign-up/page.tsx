import Link from 'next/link';

export default function SignUpPage() {
	return (
		<>
			<div className="flex h-full w-full flex-col items-center justify-center">
				<div className="w-full max-w-xs rounded-lg bg-gray-100 shadow-xl">
					<div className="w-full rounded-lg bg-white p-3">
						<h2 className="mb-4 text-center text-2xl font-bold">Új fiók létrehozása</h2>
					</div>
					<p className="flex items-center justify-center gap-1 p-3 text-xs">
						Van már fiókja?
						<Link href="/sign-in" className="text-primary">
							Bejelentkezés
						</Link>
					</p>
				</div>
			</div>
		</>
	);
}
