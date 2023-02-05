function does_user_hold_role(user, role) {
	// TODO: add database request to check if user holds that role
	return true;
}

export enum roles {
	normal_user = "loggedin_user",
	admin = "admin"
}

export function authorize(...roles: roles[]) {
	return function (req, res, next) {
		if (req.signedCookies.user) {
			const user = req.signedCookies.user;
			if (roles.length == 0 ||
				roles.some(role => does_user_hold_role(user, role))
			) {
				req.user = user;
				return next();
			}
		}
		// fallback na brak autoryzacji
		res.redirect('/login?returnUrl=' + req.url);
	}
}
