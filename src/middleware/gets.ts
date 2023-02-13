import {Express} from 'express'

import {authorize, roles} from './authorization'
import db from '../backend/database'

function logout(res) {
	res.cookie('user', '', {maxAge: -1, signed: true});
}

async function app_get(req, res) {
	// TODO: database request for items
	// const items = database.get_items();
	const items = [];
	console.log("app page requested");
	res.render('app', {username: req.user, items});
}

async function login_get(_req, res) {
	console.log("login page requested");
	res.render('login');
}

async function logout_get(_req, res) {
	logout(res);
	console.log("logout page requested");
	res.redirect('/');
}

async function new_account_get(_req, res) {
	logout(res);
	console.log("new_account page requested");
	res.render('new_account');
}

async function cart_get(req, res) {
	const user = req.signedCookies.user;
	// TODO: requset database for users cart
	// const cart = database.get_cart(user);
	const cart = await db.get_cart_by_user(user);

	// TODO: database request for item
	// cart = cart.map(database.get_item_by_id);
	console.log("cart page requested");
	res.render('cart', {username: user, cart});
}

async function new_item_get(_req, res) {
	console.log("new_item page requested");
	res.render('new_item');
}

async function change_item_get(req, res) {
	const itemToChange = req.params.id;
	// TODO: database request for item
	// const item = database.get_item_by_id(itemToChange);
	const item = await db.get_item({id: itemToChange});
	console.log("change_item page requested");
	res.render('change_item', {item});
}

async function list_users(_req, res) {
	// TODO: database request for users
	// const users = database.get_users();
	const users = await db.get_users();
	console.log("list_users page requested");
	res.render('list', {to_list: users});
}

async function list_orders(_req, res) {
	// TODO: database request for orders
	// const users = database.get_orders();
	const orders = await db.get_orders();
	console.log("list_orders page requested");
	res.render('list', {to_list: orders});
}

export default function register_gets(app: Express): void {
	app.get('/', authorize(), app_get);

	app.get('/login', authorize(), login_get);

	app.get('/logout', authorize(roles.admin, roles.normal_user), logout_get);

	app.get('/new_account', authorize(), new_account_get);

	app.get('/cart', authorize(roles.normal_user), cart_get);

	app.get('/new_item', authorize(roles.admin), new_item_get);

	app.get('/change_item/:id', authorize(roles.admin), change_item_get);

	app.get('/list_users', authorize(roles.admin), list_users);

	app.get('/list_orders', authorize(roles.admin), list_orders);
}
