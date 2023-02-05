import {authorize, roles} from './authorization'

import * as express from 'express'

function validate_login(login: string): bool {
	return /^[a-zA-Z0-9]+$/.test(login);
}

function validate_password(password: string): bool {
	const capital = /[A-Z]/.test(password);
	const number = /[0-9]/.test(password);
	return capital && number && password.length > 8;
}

function add_user(req, res) {
	const new_user: {login: string, password: string} = req.body

	// maybe sanitize fields
	if (validate_login(new_user.login) && validate_password(new_user.password)) {
		// TODO: add user to database
		// database.add_user(new_user);
		res.status(200);
		res.end();
	}
	res.status(400);
	res.end();
}

function add_order(req, res) {
	const order = req.cookies.cart;
	const user = req.signedCookies.user;

	// maybe validate order
	// database.add_order(user, order);

	res.status(200);
	res.end();
}

function login_post(req, res) {
	const username = req.body.username;
	const password = req.body.password;

	// TODO: check if password matches
	// const result = database.check_login(username, password);
	const result = true;

	if (result) {
		// wydanie ciastka
		res.cookie('user', username, {signed: true});
		// przekierowanie
		const returnUrl = req.query.returnUrl;
		res.redirect(returnUrl);
	} else {
		res.render('login', {message: "Your password and username don't match"});
	}
}

export default function register_posts(app: express.Express): void {
	const json = express.json();

	app.post('/api/user', authorize(), json, add_user);

	app.post('/api/order', authorize(roles.normal_user), json, add_order);

	app.post('/login', authorize(), json, login_post);
}

