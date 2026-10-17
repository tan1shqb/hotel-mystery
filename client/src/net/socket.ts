import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@hotel/shared';

/** One connection per tab, same origin as the page (Vite proxies it in dev). */
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();
