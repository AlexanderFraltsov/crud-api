import 'dotenv/config';

import { startServer } from './server/server';

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000;

startServer(port);
