import { existsSync } from 'node:fs';
import { createServer, type ServerResponse } from 'node:http';
import sirv from 'sirv';
import { Server } from 'socket.io';
import { registerHandlers, type IoServer } from './net/socketServer';

export interface AppOptions {
  /** Built client to serve; null or missing → API only. */
  staticDir?: string | null;
  now?: () => number;
}

function notFound(res: ServerResponse) {
  res.statusCode = 404;
  res.end('Not found');
}

/** HTTP + Socket.IO on one port: the client and the game share an origin. */
export function createApp({ staticDir = null, now = Date.now }: AppOptions = {}) {
  const serve =
    staticDir && existsSync(staticDir) ? sirv(staticDir, { single: true, etag: true }) : null;
  const httpServer = createServer((req, res) => {
    if (serve) serve(req, res, () => notFound(res));
    else notFound(res);
  });
  const io: IoServer = new Server(httpServer, { serveClient: false });
  registerHandlers(io, { now });
  return { httpServer, io, servesClient: serve !== null };
}
