import {Express} from 'express'
import {authorize, roles} from './authorization'

function logout(res) {
	res.cookie('user', '', {maxAge: -1, signed: true});
}

function app_get(req, res) {
	// TODO: database request for items
	// const items = database.get_items();
	const items = [];
	res.render('app', {user: req.user, items});
}

function login_get(_req, res) {
	res.render('login');
}

function logout_get(_req, res) {
	logout(res);
	res.redirect('/');
}

function new_account_get(_req, res) {
	logout(res);
	res.render('new_account');
}

function cart_get(req, res) {
	const user = req.signedCookies.user;
	// TODO: requset database for users cart
	// const cart = database.get_cart(user);
	const cart = [];
	
	// TODO: database request for item
	// cart = cart.map(database.get_item_by_id);
	console.log(`get request for cart site`);
	res.render('cart', {cart});
}

function new_item_get(_req, res) {
	res.render('new_item');
}

function change_item_get(req, res) {
	const itemToChange = req.params.id;
	// TODO: database request for item
	// const item = database.get_item_by_id(itemToChange);
	const item = {name: itemToChange};
	res.render('change_item', {item});
}

function list_users(_req, res) {
	// TODO: database request for users
	// const users = database.get_users();
	const users = [];
	res.render('list', {to_list: users});
}

function list_orders(_req, res) {
	// TODO: database request for orders
	// const users = database.get_orders();
	const orders = [];
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
