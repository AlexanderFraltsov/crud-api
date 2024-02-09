import { createServer } from 'node:http';
import { parse } from 'node:url';

const server = createServer((req, res) => {
	const { pathname, query } = parse(<string>req.url);
	const { method } = req;
	console.log(method, pathname, query);
	res.end('message');
});

export const startServer = (port: number) =>
	server.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
