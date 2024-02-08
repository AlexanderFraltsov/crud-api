import 'dotenv/config';

import { createServer } from 'node:http';
import { parse } from 'node:url';

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

const server = createServer((req, res) => {
	const { pathname, query } = parse(<string>req.url);
	const { method } = req;
	console.log(method, pathname, query);
	res.end('message');
});

server.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});
