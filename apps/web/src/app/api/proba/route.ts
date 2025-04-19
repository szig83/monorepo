import { NextResponse } from 'next/server'

export const GET = async () => {
	return new NextResponse('Proba api', {
		status: 200,
	})
}
