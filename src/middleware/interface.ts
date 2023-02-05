import { Express, urlencoded } from 'express';
import * as cookieParser from 'cookie-parser';

import register_gets from './gets'


export default function register_handlers(app: Express): void {
	app.use(urlencoded({extended: true}));
	app.use(cookieParser('sgs90890s8g90as8rg90as8g9r8a0srg8'));
	app.set('view engine', 'ejs');
	app.set('views', './views');


	register_gets(app);
}
