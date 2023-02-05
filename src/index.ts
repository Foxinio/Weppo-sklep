import createServer from 'http';
import express from 'express';

var app = express();

createServer(app).listen(3000);

console.log('serwer działa, nawiguj do http://localhost:3000');
