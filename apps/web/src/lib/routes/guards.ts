import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { ALL_ROUTES as ROUTES } from '@/lib/routes'

type Session = typeof auth.$Infer.Session

/**
 * Adminisztracios (zart) oldalaknal hasznalt utvonal vedelem
 *
 * @description Ha nincs bejelentkezve a felhasznalo es vedett tartalomra probal navigalni,
 * akkor automatikusan a sign-in utvonalra kerul.
 * Ha bejelentkezett felhasznalo probal navigalni egy authentikaciohoz szukseges utvonalra,
 * akkor az adminisztracios felulet vedett fooldalara kerul.
 * A kulonbozo utvonal parameterk a [lib/routes.ts](./lib/routes.ts) fajlban talalhatok.
 *
 * @param request A NextRequest objektum
 * @param session A session objektum
 * @returns A NextResponse objektum
 */
const adminGuard = (request: NextRequest, session: Session | null) => {
	console.log('adminGuard')

	const routes = ROUTES.admin
	const isAuthenticated = !!session?.user
	const publicRoutes = routes.public.auth.concat(routes.public.other)

	const isPublicRoute = publicRoutes.some((route) =>
		request.nextUrl.pathname.startsWith(`${routes.root}/${route}`),
	)

	/**
	 * Ha nincs bejelentkezve a felhasznalo es védett tartalomra probal navigalni,
	 * akkor automatikusan a sign-in utvonalra kerul.
	 */
	if (!isPublicRoute && !isAuthenticated) {
		return NextResponse.redirect(new URL(`${routes.root}/${routes.signIn}`, request.url))
	}

	/**
	 * Ha bejelentkezett felhasznalo probal navigalni egy authentikaciohoz szukseges utvonalra,
	 * akkor az adminisztracios felulet vedett főoldalara kerul.
	 */
	if (
		isPublicRoute &&
		isAuthenticated &&
		routes.public.auth.some((route) =>
			request.nextUrl.pathname.startsWith(`${routes.root}/${route}`),
		)
	) {
		return NextResponse.redirect(new URL(routes.root, request.url))
	}

	return NextResponse.next()
}

/**
 * Publikus (altalanos) oldalaknal hasznalt utvonal vedelem
 *
 * @description Ha nincs bejelentkezve a felhasznalo es vedett tartalomra probal navigalni,
 * akkor automatikusan a nyito oldalra kerul.
 * Ha bejelentkezett felhasznalo probal navigalni egy authentikaciohoz szukseges utvonalra,
 * akkor az altalanos felulet nyito oldalara kerul.
 * A kulonbozo utvonal parameterk a [lib/routes.ts](./lib/routes.ts) fajlban talalhatok.
 *
 * @param request A NextRequest objektum
 * @param session A session objektum
 * @returns A NextResponse objektum
 */
const mainGuard = (request: NextRequest, session: Session | null) => {
	console.log('mainGuard')

	const routes = ROUTES.main
	const isAuthenticated = !!session?.user
	const isProtectedRoute = routes.protected.some((route) =>
		request.nextUrl.pathname.startsWith(`${routes.root}${route}`),
	)

	/**
	 * Ha nincs bejelentkezve a felhasznalo es vedett tartalomra probal navigalni,
	 * akkor automatikusan a nyito oldalra kerul.
	 */
	if (isProtectedRoute && !isAuthenticated) {
		return NextResponse.redirect(new URL(routes.signIn, request.url))
	}

	/**
	 * Ha bejelentkezett felhasznalo probal navigalni egy authentikaciohoz szukseges utvonalra,
	 * akkor az altalanos felulet nyito oldalara kerul.
	 */
	if (
		isAuthenticated &&
		routes.public.auth.some((route) =>
			request.nextUrl.pathname.startsWith(`${routes.root}${route}`),
		)
	) {
		return NextResponse.redirect(new URL(routes.root, request.url))
	}
	return NextResponse.next()
}

/**
 * API vedelem
 *
 * @param request A NextRequest objektum
 * @param session A session objektum
 * @returns A NextResponse objektum
 */
const apiGuard = (request: NextRequest, session: Session | null) => {
	console.log('apiGuard', request.nextUrl.pathname)

	const routes = ROUTES.api
	const isAuthenticated = !!session?.user
	const isProtectedRoute = routes.protected.some((route) =>
		request.nextUrl.pathname.startsWith(`${routes.root}/${route}`),
	)

	if (isProtectedRoute && !isAuthenticated) {
		return new NextResponse('not found', {
			status: 404,
		})
	}

	return NextResponse.next()
}

/**
 * Minden utvonal vedelem egyben (admin, api, main)
 *
 * @param request A NextRequest objektum
 * @param session A session objektum
 * @returns A NextResponse objektum
 */
const allGuard = (request: NextRequest, session: Session | null) => {
	const isAdminRoute = request.nextUrl.pathname.startsWith(ROUTES.admin.root)
	const isApiRoute = request.nextUrl.pathname.startsWith(ROUTES.api.root)

	if (isAdminRoute) {
		/**
		 * Admin keresek
		 */
		return adminGuard(request, session)
	} else if (isApiRoute) {
		/**
		 * API keresek
		 */
		return apiGuard(request, session)
	} else {
		/**
		 * Altalanos keresek
		 */
		return mainGuard(request, session)
	}
}

/**
 * Utvonal vedelem
 * - Adminisztracios (zart) oldalak - admin
 * - Publikus (altalanos) oldalak - main
 * - API kivant oldalak - api
 * - Minden utvonal - all
 *
 * @param request A NextRequest objektum
 * @param session A session objektum
 * @returns A NextResponse objektum
 */
const routeGuards = {
	admin: adminGuard,
	main: mainGuard,
	api: apiGuard,
	all: allGuard,
}

export default routeGuards
