import 'dotenv/config';

import cluster, { Worker } from 'node:cluster';
import { availableParallelism } from 'node:os';

import { isMulti } from './utils';
import { startServer } from './server/server';
import { UsersRepository } from './repository/users';
import { TUser } from './repository/types';

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

if (isMulti()) {
	const numCPUs = availableParallelism();

	let users: TUser[] = [];
	if (cluster.isPrimary) {
		let counter = 0;
		const stateChangesHandler = (msg: { id: number, users: TUser[] }) => {
			users = msg.users;
			for (const id in cluster.workers) {
				cluster.workers[id].send({ cmd: 'stateChanged', users });
			}
		};
		const getStateHandler = (msg: { id: number }) => {
			cluster.workers[msg.id].send({ cmd: 'sendState', users });
		}

		const messageHandler = (msg: any) => {
			if (msg.cmd && msg.cmd === 'stateChanges') {
				stateChangesHandler(msg);
			}
			if (msg.cmd && msg.cmd === 'getState') {
				getStateHandler(msg);
			}
		};
		let workers: Worker[] = [];
		for (let i = 0; i < numCPUs; i++) {
			workers.push(cluster.fork());
		}

		cluster.on('exit', (worker, code, signal) => {
			console.log(`worker ${worker.process.pid} died`);
			workers = workers.filter(({ id }) => id === worker.id);
			workers.push(cluster.fork());
		});

		for (const id in cluster.workers) {
			cluster.workers[id]
				.on('message', messageHandler);
		}
	} else {
		startServer(port + cluster.worker.id);
	}
} else {
	startServer(port);
}
