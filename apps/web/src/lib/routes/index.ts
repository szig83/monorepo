const MAIN_ROOT_PATH = '/'
const ADMIN_ROOT_PATH = '/admin'
const API_ROOT_PATH = '/api'

export const MAIN_ROUTES = {
	root: MAIN_ROOT_PATH,
	public: {
		auth: ['sign-in', 'register'],
		other: [],
	},
	protected: ['user-profile'],
	signIn: 'sign-in',
}

export const ADMIN_ROUTES = {
	root: ADMIN_ROOT_PATH,
	public: {
		auth: ['sign-in', 'register'],
		other: [],
	},
	protected: [ADMIN_ROOT_PATH],
	signIn: 'sign-in',
}

export const API_ROUTES = {
	root: API_ROOT_PATH,
	public: [],
	protected: [],
}

export const ALL_ROUTES = {
	main: {
		...MAIN_ROUTES,
	},
	admin: {
		...ADMIN_ROUTES,
	},
	api: {
		...API_ROUTES,
	},
}
