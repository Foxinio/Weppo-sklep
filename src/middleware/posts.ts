import express from 'express'
import bcrypt from 'bcrypt'

import {authorize, roles} from './authorization'
import db from '../backend/database'

function redirect_after_login(req, res) {
	const returnUrl = req.query.returnUrl;
	if (returnUrl) {
		res.redirect(returnUrl);
	} else {
		res.redirect('/');
	}
}

function validate_login(login: string): boolean {
	return /^[a-zA-Z0-9_-]+$/.test(login);
}

function validate_password(password: string): boolean {
	const capital = /[A-Z]/.test(password);
	const number = /[0-9]/.test(password);
	return capital && number && validate_login(password) && password.length >= 8;
}

async function add_user(req, res) {
	const username = req.body.username;
	const password = req.body.password;

	if (validate_login(username) && validate_password(password)) {
		const hash = await bcrypt.hash(password, 12);
		const new_user = {username, passwordhash: hash};
		const added_user = await db.add_user(new_user);
	
		if (added_user !== undefined) {
			console.log(`added user ${JSON.stringify(new_user)} to database`);
			res.cookie('user', added_user.id, {signed: true});
			redirect_after_login(req, res);
		}
	}

	res.render('login', {message: "Given password or username don't satisfy safty cryteria"});
}

async function add_order(req, res) {
	const user = req.user;
	await db.place_order_by_user(user);
	console.log(`added order from user: ${user} to database`);

	res.status(200);
	res.end();
}

async function cart_get(req, res) {
	const user = req.user;
	const result = await db.get_cart_by_user(user);
	console.log(`responding with cart of user: ${user} to database`);

	res.json(result);
}

async function update_cart(req, res) {
	const id = req.params.id;
	const user = req.user;
	console.log(`adding item to database. User: ${JSON.stringify(user)}, item_id: ${id}`);
	await db.add_item_to_cart({id}, user);
	console.log(`added item of id: ${id} to cart of user ${user}`);

	res.status(200);
	res.end();
}

async function login_post(req, res) {
	const username = req.body.username;
	const password = req.body.password;

	const user = await db.get_user_by_username(username);

	if (user && password && await bcrypt.compare(password, user.passwordhash)) {
		console.log(`loging in user ${username}`);
		res.cookie('user', user.id, {signed: true});
		redirect_after_login(req, res);
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

