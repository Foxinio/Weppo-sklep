import express from 'express';
import cookieParser from 'cookie-parser';

import register_handlers from './middleware/interface'

import { createServer } from 'http';

import db from './backend/database'
//import fs from 'node:fs'

console.log(JSON.stringify(express));

const app = express();
const port = process.env.port || 3000;

register_handlers(app);

db.connect().then(() => {
	createServer(app).listen(port);

	console.log(`server started on port ${port}`);
});
