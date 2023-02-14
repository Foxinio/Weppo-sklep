import * as express from 'express'

import {authorize, roles} from './authorization'
import db from '../backend/database'

async function get_item(req, res) {
	const id = req.params.id;

	const item = await db.get_item({id});
	res.json(item);
}

async function query_items(req, res) {
	const query = req.query.search_input;

	const results = await db.query_items(query);
	console.log(`quering database for ${JSON.stringify(query)}`);
	console.log(`rendering app page with items: ${results}`);

	const username = req.user;
	const role = req.user.role;
	res.render('app', {username, role, items: results});
}

async function add_item(req, res) {
	const new_item = req.body;

	const db_res = await db.add_item(new_item);
	console.log(`added item ${JSON.stringify(new_item)} to database`);

	res.json(db_res);
}

async function modify_item(req, res) {
	const modified_item = req.body;

	const db_res = await db.modify_item(modified_item);
	console.log(`modified item ${JSON.stringify(modified_item)} in database`);

	res.json(db_res);
}

async function delete_item(req, res) {
	const id = req.params.id;

	db.delete_item({id});
	console.log(`deleted item with id ${id} from database`);

	res.status(200);
	res.end()
}

export default function register_api(app: express.Express): void {
	const json = express.json();

	app.get('/api/item/:id', authorize(), json, get_item);

	app.get('/api/query', authorize(), json, query_items);

	app.post('/api/item', authorize(roles.admin), json, add_item);

	app.put('/api/item', authorize(roles.admin), json, modify_item);

	app.delete('/api/item/:id', authorize(roles.admin), delete_item);
}
