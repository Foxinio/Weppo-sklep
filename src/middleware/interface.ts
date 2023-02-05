import register_api from './api'
import register_gets from './gets'
import register_posts from './posts'

import * as express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';

export default function register_handlers(app: express.Express) {
	app.set('view engine', 'ejs');
	app.set('views', './views');

	const session_secret = process.env.session_secret || "qewhiugriasgy";
	const cookie_secret = process.env.cookie_secret || "sgs90890s8g90as8rg90as8g9r8a0srg8";

	app.disable('etag');
	app.use(express.urlencoded({extended: true}));
	app.use(cookieParser(cookie_secret));

	app.use(express.static("../static"));


	app.use(session({resave:true, saveUninitialized: true, secret: session_secret }));


	register_api(app);
	register_gets(app);
	register_posts(app);
}
