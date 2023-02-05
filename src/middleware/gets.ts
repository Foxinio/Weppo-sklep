import Express from 'express'
import authorize from './authorization'

export function app_get (req, res) {
	res.render('app', {user: req.user});
}

export function login_get (req, res) {
	res.render('login');
}

export function logout_get (req, res) {
	res.cookie('user', '', {maxAge: -1, signed: true});
	res.redirect('/');
}

export function new_item_get (req,res) {
	res.render('new_item');
}

export function change_item_get (req, res) {
	let itemToChange = req.query.itemToChange;
	let item = {}; // database request for item
	res.render('change_item', { item });
}

export function new_account_get (req, res) {
	res.cookie('user', '', {maxAge: -1});
	res.render('new_account');
}

export function basket_get (req, res) {
	res.cookie
}


export default function register_gets(app: Express.Express): void {
	app.get('/', authorize(), app_get);

	app.get('/login', authorize(), login_get);

	app.get('/logout', authorize(), logout_get);

	app.get('/basket', authorize(
}
