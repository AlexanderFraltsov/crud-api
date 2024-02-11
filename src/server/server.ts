import { URL } from 'node:url';
import { createServer } from 'node:http';

import { parseBody } from '../utils';
import { EHttpMethod } from '../enums';
import { routeResolve } from '../routing/route-resolve';

export const startServer = (port: number) =>
	createServer((req, res) => {
		const { host, pathname }  = new URL(req.url, `http://${req.headers.host}/`);
		const { method } = req;
		const data: Buffer[] = [];
		req
			.on('error', (err) => console.error(err))
			.on('data', (chunk: Buffer) => data.push(chunk))
			.on('end', () => routeResolve({
				method: <EHttpMethod>method.toUpperCase(),
				host,
				pathname,
				body: data.length > 0 ? parseBody(data) : null,
			},
			res,
		));
	})
	.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
