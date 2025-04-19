import type { Metadata } from 'next'
import { Geist, Geist_Mono, Jersey_15 } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

const jersey15 = Jersey_15({
	variable: '--font-jersey-15',
	subsets: ['latin'],
	weight: '400',
})

export const metadata: Metadata = {
	title: 'Project 01',
	description: 'Project 01 leírás',
}

export default function RootLayout(props: { children: React.ReactNode }) {
	return (
		<html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${jersey15.variable}`}>
			<body className="antialiased">{props.children}</body>
		</html>
	)
}
