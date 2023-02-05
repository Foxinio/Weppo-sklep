import register_handlers from './middleware/interface'
import register_api from './middleware/api'
import register_gets from './middleware/gets'
import register_posts from './middleware/posts'

import { createServer } from 'https';
import * as express from 'express';
//import fs from 'node:fs'

const app = express();
const port = process.env.port || 3000;

register_api(app);
register_gets(app);
register_posts(app);
register_handlers(app);

createServer(
//	{
//		pfx: fs.readFileSync('cert.pfx'),
//		passphrase: 'password'
//	},
	app).listen(port);

console.log(`server started on port ${port}`);
