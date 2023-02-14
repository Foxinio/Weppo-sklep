import db from '../backend/database'

export enum roles {
	normal_user = "loggedin_user",
	admin = "admin"
}

export function authorize(...roles: roles[]) {
	return async function (req, res, next) {
		if (req.signedCookies.user) {
			const username = req.signedCookies.user;
			const user = await db.get_user_by_username(username);
			if (roles.length === 0 || roles.some(role => role === user.role)) {
				req.user = user;
				return next();
			}
			console.log(`authorization failed for user: ${username}, required roles are: ${roles}`);
		}
		else if (roles.length === 0) {
			return next();
		}
		// fallback na brak autoryzacji
		res.redirect('/login?returnUrl=' + req.url);
	}
}
