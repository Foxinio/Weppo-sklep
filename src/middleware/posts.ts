import express from 'express'
import {hashSync, compareSync} from 'bcrypt'

import {authorize, roles} from './authorization'
import db from '../backend/database'

function validate_login(login: string): boolean {
	return /^[a-zA-Z0-9_-]+$/.test(login);
}

function validate_password(password: string): boolean {
	const capital = /[A-Z]/.test(password);
	const number = /[0-9]/.test(password);
	return capital && number && password.length > 8;
}

async function add_user(req, res) {
	const username = req.body.username;
	const password = req.body.password;

	// maybe sanitize fields
	if (validate_login(username) && validate_password(password)) {
		const hash = hashSync(password, 12);
		const new_user = {id: undefined, username, passwordHash: hash};
		await db.add_user(new_user);
		// TODO: add user to database
		// database.add_user(new_user);
		console.log(`added user ${JSON.stringify(new_user)} to database`);
		res.status(200);
		res.end();
	}
	res.status(400);
	res.end();
}

async function add_order(req, res) {
	const user = req.signedCookies.user;

	// TODO: database request: add users cart as an order
	// database.add_order(user);
	await db.place_order_by_user(user);
	console.log(`added order from user: ${user} to database`);

	res.status(200);
	res.end();
}

async function cart_get(req, res) {
	const user = req.signedCookies.user;

	// TODO: database request to get current users cart
	// const result = database.get_cart(user);
	const result = await db.get_cart_by_user(user);
	console.log(`responding with cart of user: ${user} to database`);

	res.json(result);
}

async function update_cart(req, res) {
	const id = req.params.id;
	const user = req.signedCookies.user;

	// TODO: database request to add item to users cart
	// database.update_cart(user, id);
	await db.add_item_to_cart({id}, user);
	console.log(`added item of id: ${id} to cart of user ${user}`);

	res.status(200);
	res.end();
}

async function login_post(req, res) {
	const username = req.body.username;
	const password = req.body.password;

	// TODO: check if password matches
	// const scrambled_password = database.get_scrambled_password(username);
	const user_with_password = await db.get_user_with_password(username);
	const scrambled_password = user_with_password.passwordHash;
	const result = compareSync(password, scrambled_password);

	if (result) {
		console.log(`loging in user ${username}`);
		res.cookie('user', username, {signed: true});
		const returnUrl = req.query.returnUrl;
		res.redirect(returnUrl);
	} else {
		res.render('login', {message: "Given password and username don't match"});
	}
}

export default function register_posts(app: express.Express): void {
	const json = express.json();

	app.post('/api/user', authorize(), json, add_user);

	app.post('/api/order', authorize(roles.normal_user), json, add_order);

	app.get('/api/cart', authorize(roles.normal_user), json, cart_get);

	app.post('/api/cart/:id', authorize(roles.normal_user), json, update_cart);

	app.post('/login', authorize(), json, login_post);
}

