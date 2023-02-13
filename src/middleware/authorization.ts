import db from '../backend/database'

export enum roles {
	normal_user = "loggedin_user",
	admin = "admin"
}

export function authorize(...roles: roles[]) {
	return async function (req, res, next) {
		if (roles.length === 0) {
			return next();
		}
		else if (req.signedCookies.user) {
			const user = req.signedCookies.user;
			const user_role = await db.get_user_role(user);
			if (roles.some(role => role === user_role)) {
				req.user = user;
				return next();
			}
			console.log(`authorization failed for user: ${user}, required roles are: ${roles}`);
		}
		// fallback na brak autoryzacji
		res.redirect('/login?returnUrl=' + req.url);
	}
}
