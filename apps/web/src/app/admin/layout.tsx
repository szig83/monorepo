import { Providers } from './providers';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
	return <Providers>{children}</Providers>;
}
