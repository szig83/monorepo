import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
//import { auth } from '@/lib/auth'
import { config as conf } from '@/lib/config'
//import routeGuards from '@/lib/routes/guards'

//type Session = typeof auth.$Infer.Session

/**
 * Keresek elott futo logika
 *
 * @description Authentikacio kezelese es utvonal navigalas
 *
 * @param request A NextRequest objektum
 * @returns A NextResponse objektum
 */
export async function middleware(request: NextRequest) {
	const sessionCookie = getSessionCookie(request, {
		cookiePrefix: conf.SESSION_COOKIE_PREFIX,
	})
	console.log(sessionCookie)
	return NextResponse.next()
	//return routeGuards.all(request, sessionCookie)
	//if (!request.nextUrl.pathname.startsWith('/get-session')) {
	/*	const { data: session } = await betterFetch<Session>('/api/auth/get-session', {
			baseURL: request.nextUrl.origin,
			query: {
				//disableCookieCache: true,
				//disableRefresh: true,
			},
			headers: {
				cookie: request.headers.get('cookie') || '',
			},
		})
*/
	/**
	 * Utvonal vedelem
	 */
	//return routeGuards.all(request, session)
	//console.log(session)
	//	return NextResponse.next()
	/*} else {
		return NextResponse.next()
	}*/
}

/**
 * A middleware csak akkor fut le, ha az URL:
 * - Nem statikus fájl (pl. nem egy képfájl vagy JavaScript/CSS).
 * - Nem Next.js belső fájlokkal kapcsolatos (/_next/).
 * - Viszont minden más URL-re (dinamikus és statikus oldalak, API hívások) végrehajtódik.
 */
export const config = {
	matcher: ['/((?!.+\\.[\\w]+$|_next).*)'],
}
