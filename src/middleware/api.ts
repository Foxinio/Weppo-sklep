import {authorize, roles} from './authorization'

import * as express from 'express'

function get_item(req, res) {
	const id = req.params.id;

	// TODO: database request for item by id
	// const item = database.get_item_by_id(id);
	const item = { id };
	res.json(item);
}

function query_items(req, res) {
	const query = req.query;

	// TODO: database query for items
	// const results = database.query_items(query);
	const results = [];
	console.log(`quering database for ${JSON.stringify(query)}`);

	res.json(results);
}

function add_item(req, res) {
	const new_item = req.body;

	// TODO: database add item to database
	// const new_item = database.add_item(new_item);
	console.log(`added item ${JSON.stringify(new_item)} to database`);

	res.json(new_item);
}

function modify_item(req, res) {
	const modified_item = req.body;

	// TODO: database modify item in database
	// const modified_item = database.modify_item(modified_item);
	console.log(`modified item ${JSON.stringify(modified_item)} in database`);

	res.json(modified_item);
}

function delete_item(req, res) {
	const id = req.params.id;

	// TODO: database delete item in database
	// database.delete_item_by_id(id);
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
