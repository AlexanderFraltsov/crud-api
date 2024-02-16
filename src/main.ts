import 'dotenv/config';

import cluster, { Worker } from 'node:cluster';
import { availableParallelism } from 'node:os';

import { TUser } from './repository/types';
import { isMulti } from './utils';
import { startServer } from './server/server';
import { EClusterMessage } from './enums';
import { TClusterMessage } from './types';
import { startLoadBalancer } from './load-balancer/load-balancer';

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

if (isMulti()) {
	const numCPUs = availableParallelism();

	if (cluster.isPrimary) {
		let users: TUser[] = [];

		let workers: Worker[] = [];

		for (let i = 0; i < numCPUs; i++) {
			workers.push(cluster.fork());
		}

		const stateChangesHandler = (msg: TClusterMessage) => {
			users = msg.users;
			for (const id in cluster.workers) {
				if (id !== msg.id.toString()) {
					cluster.workers[id].send({ cmd: EClusterMessage.STATE_CHANGED, users });
				}
			}
		};

		const getStateHandler = (msg: TClusterMessage) => {
			cluster.workers[msg.id].send({ cmd: EClusterMessage.SEND_STATE, users });
		}

		const messageHandler = (msg: TClusterMessage) => {
			if (msg.cmd && msg.cmd === EClusterMessage.STATE_CHANGES) {
				stateChangesHandler(msg);
			}
			if (msg.cmd && msg.cmd === EClusterMessage.GET_STATE) {
				getStateHandler(msg);
			}
		};

		cluster.on('exit', (worker) => {
			console.log(`worker ${worker.process.pid} died`);
			workers = workers.filter(({ id }) => id === worker.id);
			workers.push(cluster.fork());
		});

		for (const id in cluster.workers) {
			cluster.workers[id].on('message', messageHandler);
		}

		startLoadBalancer(port, numCPUs);
	} else {
		startServer(port + cluster.worker.id);
	}
} else {
	startServer(port);
}
