import { IncomingMessage, ServerResponse } from 'node:http';

export type TResponse = ServerResponse<IncomingMessage> & {
	req: IncomingMessage;
}
