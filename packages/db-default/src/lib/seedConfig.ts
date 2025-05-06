export const groups = {
	sysadmin: {
		id: 1,
		name: {
			hu: 'Rendszergazda',
			en: 'System Administrator',
		},
		description: {
			hu: 'Korlátlan jogosultsággal rendelkező felhasználók, akik a teljes rendszert felügyelik és karbantartják',
			en: 'Users with unlimited permissions who oversee and maintain the entire system',
		},
	},
	admin: {
		id: 2,
		name: {
			hu: 'Adminisztrátor',
			en: 'Administrator',
		},
		description: {
			hu: 'Teljes hozzáféréssel rendelkező felhasználók, akik kezelhetik a felhasználókat és minden adminisztrációs funkciót elérnek',
			en: 'Users with full access who manage users and all administrative functions',
		},
	},
	content_editor: {
		id: 3,
		name: {
			hu: 'Tartalomszerkesztő',
			en: 'Content Editor',
		},
		description: {
			hu: 'A publikus oldal tartalmainak kezelésére jogosult felhasználók, akik új tartalmakat hozhatnak létre és szerkeszthetik a meglévőket',
			en: 'Users with the ability to manage public page content, creating new content and editing existing content',
		},
	},
	public_user: {
		id: 4,
		name: {
			hu: 'Általános felhasználó',
			en: 'General User',
		},
		description: {
			hu: 'Alapszintű hozzáférőssel rendelkező felhasználók, akik bejelentkezés után használhatják az oldal publikus funkcióit',
			en: 'Users with basic access who can use the public features of the page after logging in',
		},
	},
};

export const users = {
	sysadmin: {
		groupId: groups.sysadmin.id,
		name: 'Rendszergazda',
		email: 'sysadmin@example.com',
		password: 'Balazs19830904',
	},
	admin: {
		groupId: groups.admin.id,
		name: 'Admin',
		email: 'admin@example.com',
		password: 'Balazs19830904',
	},
	content_editor: {
		groupId: groups.content_editor.id,
		name: 'Tartalomszerkesztő',
		email: 'content_editor@example.com',
		password: 'Balazs19830904',
	},
	public_user: {
		groupId: groups.public_user.id,
	},
};

export const resources = {
	users: {
		id: 1,
		name: 'users',
		description: 'Felhasználók adatainak kezelése',
	},
	groups: {
		id: 2,
		name: 'groups',
		description: 'Felhasználói csoportok kezelése',
	},
	roles: {
		id: 3,
		name: 'roles',
		description: 'Szerepkörök kezelése',
	},
	permissions: {
		id: 4,
		name: 'permissions',
		description: 'Jogosultságok kezelése',
	},
	content: {
		id: 5,
		name: 'content',
		description: 'Tartalmak kezelése',
	},
	settings: {
		id: 6,
		name: 'settings',
		description: 'Rendszerbeállítások kezelése',
	},
};

export const permissions = {
	// Felhasználók kezelése
	users_view: {
		id: 1,
		name: 'users:view',
		description: 'Felhasználók megtekintése',
		resourceId: resources.users.id,
	},
	users_create: {
		id: 2,
		name: 'users:create',
		description: 'Felhasználók létrehozása',
		resourceId: resources.users.id,
	},
	users_update: {
		id: 3,
		name: 'users:update',
		description: 'Felhasználók módosítása',
		resourceId: resources.users.id,
	},
	users_delete: {
		id: 4,
		name: 'users:delete',
		description: 'Felhasználók törlése',
		resourceId: resources.users.id,
	},

	// Csoportok kezelése
	groups_view: {
		id: 5,
		name: 'groups:view',
		description: 'Csoportok megtekintése',
		resourceId: resources.groups.id,
	},
	groups_create: {
		id: 6,
		name: 'groups:create',
		description: 'Csoportok létrehozása',
		resourceId: resources.groups.id,
	},
	groups_update: {
		id: 7,
		name: 'groups:update',
		description: 'Csoportok módosítása',
		resourceId: resources.groups.id,
	},
	groups_delete: {
		id: 8,
		name: 'groups:delete',
		description: 'Csoportok törlése',
		resourceId: resources.groups.id,
	},

	// Szerepkörök kezelése
	roles_view: {
		id: 9,
		name: 'roles:view',
		description: 'Szerepkörök megtekintése',
		resourceId: resources.roles.id,
	},
	roles_create: {
		id: 10,
		name: 'roles:create',
		description: 'Szerepkörök létrehozása',
		resourceId: resources.roles.id,
	},
	roles_update: {
		id: 11,
		name: 'roles:update',
		description: 'Szerepkörök módosítása',
		resourceId: resources.roles.id,
	},
	roles_delete: {
		id: 12,
		name: 'roles:delete',
		description: 'Szerepkörök törlése',
		resourceId: resources.roles.id,
	},

	// Jogosultságok kezelése
	permissions_view: {
		id: 13,
		name: 'permissions:view',
		description: 'Jogosultságok megtekintése',
		resourceId: resources.permissions.id,
	},
	permissions_assign: {
		id: 14,
		name: 'permissions:assign',
		description: 'Jogosultságok hozzárendelése',
		resourceId: resources.permissions.id,
	},

	// Tartalom kezelése
	content_view: {
		id: 15,
		name: 'content:view',
		description: 'Tartalmak megtekintése',
		resourceId: resources.content.id,
	},
	content_create: {
		id: 16,
		name: 'content:create',
		description: 'Tartalmak létrehozása',
		resourceId: resources.content.id,
	},
	content_update: {
		id: 17,
		name: 'content:update',
		description: 'Tartalmak módosítása',
		resourceId: resources.content.id,
	},
	content_delete: {
		id: 18,
		name: 'content:delete',
		description: 'Tartalmak törlése',
		resourceId: resources.content.id,
	},
	content_publish: {
		id: 19,
		name: 'content:publish',
		description: 'Tartalmak publikálása',
		resourceId: resources.content.id,
	},

	// Rendszerbeállítások
	settings_view: {
		id: 20,
		name: 'settings:view',
		description: 'Beállítások megtekintése',
		resourceId: resources.settings.id,
	},
	settings_update: {
		id: 21,
		name: 'settings:update',
		description: 'Beállítások módosítása',
		resourceId: resources.settings.id,
	},
};

export const roles = {
	sysadmin: {
		id: 1,
		name: 'Rendszergazda',
		description: 'Korlátlan jogosultsággal rendelkező szerep',
	},
	admin: {
		id: 2,
		name: 'Adminisztrátor',
		description: 'Adminisztrációs feladatok elvégzésére jogosult szerep',
	},
	editor: {
		id: 3,
		name: 'Szerkesztő',
		description: 'Tartalmak kezelésére jogosult szerep',
	},
	user: {
		id: 4,
		name: 'Felhasználó',
		description: 'Alapszintű felhasználói szerep',
	},
};

export const rolePermissions = [
	// Rendszergazda jogosultságok (minden jogosultság)
	...Object.values(permissions).map((permission) => ({
		roleId: roles.sysadmin.id,
		permissionId: permission.id,
	})),

	// Adminisztrátor jogosultságok
	{ roleId: roles.admin.id, permissionId: permissions.users_view.id },
	{ roleId: roles.admin.id, permissionId: permissions.users_create.id },
	{ roleId: roles.admin.id, permissionId: permissions.users_update.id },
	{ roleId: roles.admin.id, permissionId: permissions.groups_view.id },
	{ roleId: roles.admin.id, permissionId: permissions.groups_update.id },
	{ roleId: roles.admin.id, permissionId: permissions.roles_view.id },
	{ roleId: roles.admin.id, permissionId: permissions.content_view.id },
	{ roleId: roles.admin.id, permissionId: permissions.content_create.id },
	{ roleId: roles.admin.id, permissionId: permissions.content_update.id },
	{ roleId: roles.admin.id, permissionId: permissions.content_delete.id },
	{ roleId: roles.admin.id, permissionId: permissions.content_publish.id },
	{ roleId: roles.admin.id, permissionId: permissions.settings_view.id },

	// Szerkesztő jogosultságok
	{ roleId: roles.editor.id, permissionId: permissions.content_view.id },
	{ roleId: roles.editor.id, permissionId: permissions.content_create.id },
	{ roleId: roles.editor.id, permissionId: permissions.content_update.id },
	{ roleId: roles.editor.id, permissionId: permissions.content_publish.id },

	// Felhasználó jogosultságok
	{ roleId: roles.user.id, permissionId: permissions.content_view.id },
];

export const groupPermissions = [
	// Rendszergazda csoport jogosultságok (minden jogosultság)
	...Object.values(permissions).map((permission) => ({
		groupId: groups.sysadmin.id,
		permissionId: permission.id,
	})),

	// Adminisztrátor csoport jogosultságok
	{ groupId: groups.admin.id, permissionId: permissions.users_view.id },
	{ groupId: groups.admin.id, permissionId: permissions.users_create.id },
	{ groupId: groups.admin.id, permissionId: permissions.users_update.id },
	{ groupId: groups.admin.id, permissionId: permissions.groups_view.id },
	{ groupId: groups.admin.id, permissionId: permissions.roles_view.id },
	{ groupId: groups.admin.id, permissionId: permissions.content_view.id },
	{ groupId: groups.admin.id, permissionId: permissions.content_create.id },
	{ groupId: groups.admin.id, permissionId: permissions.content_update.id },
	{ groupId: groups.admin.id, permissionId: permissions.content_delete.id },
	{ groupId: groups.admin.id, permissionId: permissions.content_publish.id },
	{ groupId: groups.admin.id, permissionId: permissions.settings_view.id },

	// Tartalomszerkesztő csoport jogosultságok
	{
		groupId: groups.content_editor.id,
		permissionId: permissions.content_view.id,
	},
	{
		groupId: groups.content_editor.id,
		permissionId: permissions.content_create.id,
	},
	{
		groupId: groups.content_editor.id,
		permissionId: permissions.content_update.id,
	},
	{
		groupId: groups.content_editor.id,
		permissionId: permissions.content_publish.id,
	},

	// Általános felhasználói csoport jogosultságok
	{ groupId: groups.public_user.id, permissionId: permissions.content_view.id },
];

export const providers = {
	local: {
		name: 'credential',
		enabled: true,
		config: {
			allowRegistration: true,
			requireEmailVerification: true,
			passwordMinLength: 8,
		},
	},
	google: {
		name: 'google',
		enabled: true,
		config: {
			clientId: 'YOUR_GOOGLE_CLIENT_ID',
			clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
			callbackUrl: 'http://localhost:3000/api/auth/callback/google',
		},
	},
	facebook: {
		name: 'facebook',
		enabled: false,
		config: {
			clientId: '',
			clientSecret: '',
			callbackUrl: 'http://localhost:3000/api/auth/callback/facebook',
		},
	},
	github: {
		name: 'github',
		enabled: false,
		config: {
			clientId: '',
			clientSecret: '',
			callbackUrl: 'http://localhost:3000/api/auth/callback/github',
		},
	},
};

export const userRoles = [
	// Rendszergazda felhasználó szerepkörei
	{ userId: 1, roleId: roles.sysadmin.id },

	// Admin felhasználó szerepkörei
	{ userId: 2, roleId: roles.admin.id },

	// Tartalomszerkesztő felhasználó szerepkörei
	{ userId: 3, roleId: roles.editor.id },

	// Alapértelmezett szerepkör minden felhasználónak
	{ userId: 1, roleId: roles.user.id },
	{ userId: 2, roleId: roles.user.id },
	{ userId: 3, roleId: roles.user.id },
];

export const seedConfig = {
	users,
	groups,
	resources,
	permissions,
	roles,
	rolePermissions,
	groupPermissions,
	providers,
	userRoles,
};
