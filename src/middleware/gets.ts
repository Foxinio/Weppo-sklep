import {Express} from 'express'
import {authorize, roles} from './authorization'

function logout(res) {
	res.cookie('user', '', {maxAge: -1, signed: true});
}

function app_get(req, res) {
	// TODO: database request for items
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
	let cart: object[] = [];
	if (req.cookies.cart) {
		cart = req.cookies.cart;
		// TODO: database request for item
//		cart = cart.map(database.get_item_by_id);
	}
	res.render('cart', {cart});
}

function new_item_get(_req, res) {
	res.render('new_item');
}

function change_item_get(req, res) {
	const itemToChange = req.query.itemToChange;
	// TODO: database request for item
	const item = {name: itemToChange};
	res.render('change_item', {item});
}

function list_users(_req, res) {
	// TODO: database request for users
	const users = [];
	res.render('list', {to_list: users});
}

function list_orders(_req, res) {
	// TODO: database request for orders
	const orders = [];
	res.render('list', {to_list: orders});
}

export default function register_gets(app: Express): void {
	app.get('/', authorize(), app_get);

	app.get('/login', authorize(), login_get);

	app.get('/logout', authorize(roles.admin, roles.normal_user), logout_get);

	app.get('/new_account', authorize(), new_account_get);

	app.get('/cart', authorize(roles.normal_user), cart_get);

	app.get('/newitem', authorize(roles.admin), new_item_get);

	app.get('/changeitem', authorize(roles.admin), change_item_get);

	app.get('/list_users', authorize(roles.admin), list_users);

	app.get('/list_orders', authorize(roles.admin), list_orders);
}
