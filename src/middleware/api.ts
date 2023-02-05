import {authorize, roles} from './authorization'

import * as express from 'express'

function get_item(req, res) {
	const id = req.params.id;
	const item = {};
	// const item = database.get_item_by_id(id);
	res.json(item);
}

function query_items(req, res) {
	const query = req.query;
	// TODO: database query for items
	const results = [];
	// const results = database.query_items(query);
	console.log(`quering database for ${JSON.stringify(query)}`);
	res.json(results);
}

function add_item(req, res) {
	const new_item = req.body;

	// maybe manipulate item

	// TODO: database add item to database
	// const new_item = database.add_item(new_item);
	console.log(`added item ${JSON.stringify(new_item)} to database`);
	res.json(new_item);
}

function modify_item(req, res) {
	const modified_item = req.body;

	// maybe manipulate item
	// maybe validate item

	// TODO: database modify item in database
	// const modified_item = database.modify_item(modified_item);
	console.log(`modified item ${JSON.stringify(modify_item)} in database`);
	res.json(modified_item);
}

function delete_item(req, res) {
	const item_to_delete = req.body;

	// maybe manipulate item
	// maybe validate item

	// TODO: database delete item in database
	// database.delete_item_by_id(new_item.id);
	console.log(`deleted item ${JSON.stringify(item_to_delete)} from database`);
	res.status(200);
	res.end()
}

export default function register_api(app: express.Express): void {
	const json = express.json();

	app.get('/api/item/:id', authorize(), json, get_item);

	app.get('/api/query', authorize(), json, get_item);

	app.post('/api/item', authorize(roles.admin), json, add_item);

	app.put('/api/item/:id', authorize(roles.admin), json, modify_item);

	app.delete('/api/item/:id', authorize(roles.admin), modify_item);
}
