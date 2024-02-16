import { URL } from 'node:url';
import { createServer, IncomingMessage, request, RequestOptions } from 'node:http';

import { parseBody } from '../utils';
import { TResponse } from '../types/response.type';

const handler = (req: IncomingMessage, res: TResponse, counter: number) => {
		const getNewHost = () => {
			const [path, port] = req.headers.host.split(':');
			return `${path}:${Number.parseInt(port) + counter}`
		}
		const data: Buffer[] = [];
		req
			.on('error', (err) => console.error(err))
			.on('data', (chunk: Buffer) => {
				data.push(chunk)
			})
			.on('end', () => {
				const url = new URL(req.url, `http://${getNewHost()}/`);
				const { hostname, port, pathname } = url;
				const options: RequestOptions = {
					method: req.method,
					hostname,
					port,
					path: pathname,
				}
				const newReq = request(
					options,
					(response) => {
						let data2: string | null = null;
						response.setEncoding('utf-8');
						response.on('data', (chunk: any) => {
							data2 = chunk;
						});
						response.on('end', () => {
							res.writeHead(response.statusCode);
							if (data2) {
								res.write(data2, () => {
									res.end();
								});
							} else {
								res.end();
							}
						});
					}
				);
				if (data.length > 0) {
					newReq.write(JSON.stringify(parseBody(data)), () => {
						newReq.end();
					});
				} else {
					newReq.end();
				}
			}
		);
}

export const startLoadBalancer = (port: number, cpus: number) => {
	let counter = 1;

	return createServer((req, res) => {
		handler(req, res, counter);

		if (counter === cpus) {
			counter = 1;
		} else {
			counter += 1;
		}
	})
		.listen(port, () => {
			console.log(`Load balancer listening on port ${port}`);
		});
}
