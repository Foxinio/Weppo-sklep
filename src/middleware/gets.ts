import {Express} from 'express'

import {authorize, roles} from './authorization'
import db from '../backend/database'

function logout(res) {
	res.cookie('user', '', {maxAge: -1, signed: true});
}

async function app_get(req, res) {
	const items = await db.get_items();
	console.log("app page requested");
	const role = req.user ? req.user.role : "";
	const username = req.user ? req.user.username : undefined;
	res.render('app', {username, items, role});
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

async function cart_get(req, res) {
	const user = req.user;
	const cart = await db.get_cart_by_user(user);
	const items = await db.get_order_items(cart);
	const role = req.user.role;

	console.log(`cart page requested. Items: [${items}]`);
	res.render('cart', {username: user.username, items, title: "Your cart", role});
}

async function new_item_get(req, res) {
	console.log("new_item page requested");
	const role = req.user.role;
	const username = req.user.username;
	res.render('change_item', {item: undefined, role, username});
}

async function change_item_get(req, res) {
	const itemToChange = req.params.id;
	const item = await db.get_item({id: itemToChange});
	const role = req.user.role;
	const username = req.user.username;
	console.log("change_item page requested");
	res.render('change_item', {item, role, username});
}

async function list_users(req, res) {
	// TODO: database request for users
	// const users = database.get_users();
	const users = await db.get_users();
	const role = req.user.role;
	const username = req.user.username;
	console.log("list_users page requested");
	res.render('list_users', {users: users, username, role});
}

async function list_orders(req, res) {
	// TODO: database request for orders
	// const users = database.get_orders();
	const orders = await db.get_orders();
	const role = req.user.role;
	const username = req.user.username;
	console.log("list_orders page requested");
	res.render('list_orders', {orders: orders, username, role});
}

async function list_order(req, res) {
	// TODO: database request for orders
	// const users = database.get_orders();
	const order_id = req.params.id;
	const role = req.user.role;
	const items = await db.get_order_items({id: order_id});
	const title = "";
	console.log("list_order page requested");
	res.render('cart', {username: req.user.username, items, title, role});
}

export default function register_gets(app: Express): void {
	app.get('/', authorize(), app_get);

	app.get('/login', authorize(), login_get);

	app.get('/logout', authorize(roles.admin, roles.normal_user), logout_get);

	app.get('/cart', authorize(roles.normal_user), cart_get);

	app.get('/new_item', authorize(roles.admin), new_item_get);

	app.get('/change_item/:id', authorize(roles.admin), change_item_get);

	app.get('/list_users', authorize(roles.admin), list_users);

	app.get('/list_orders', authorize(roles.admin), list_orders);

	app.get('/list_order/:id', authorize(roles.admin), list_order);
}
