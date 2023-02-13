import { singleton as db } from '../backend/database'

export enum roles {
	normal_user = "loggedin_user",
	admin = "admin"
}

export function authorize(...roles: roles[]) {
	return async function (req, res, next) {
		if (req.signedCookies.user) {
			const user = req.signedCookies.user;
			const user_role = await db.get_user_role(user);
			if (roles.length == 0 ||
				roles.some(role => role === user_role)
			) {
				req.user = user;
				return next();
			}
		}
		// fallback na brak autoryzacji
		res.redirect('/login?returnUrl=' + req.url);
	}
}
