import express from 'express';
import register_handlers from './middleware/interface'

import { createServer } from 'https';
//import fs from 'node:fs'

console.log(JSON.stringify(express));

const app = express();
const port = process.env.port || 3000;

register_handlers(app);

createServer(
//	{
//		pfx: fs.readFileSync('cert.pfx'),
//		passphrase: process.env.CERT_PASSWORD || 'password'
//	},
	app).listen(port);

console.log(`server started on port ${port}`);
