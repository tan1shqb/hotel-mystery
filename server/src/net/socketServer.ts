import type { Server, Socket } from 'socket.io';
import {
  c2sSchemas,
  type AckOf,
  type C2SEvent,
  type C2SPayload,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from '@hotel/shared';

export type IoServer = Server<ClientToServerEvents, ServerToClientEvents>;
type IoSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export interface HandlerDeps {
  now: () => number;
}

/**
 * Registers a client→server event. Payloads are untrusted: a missing ack is
 * ignored, a payload that fails its schema gets `badPayload`, and a thrown
 * handler gets `internal` instead of crashing the process.
 */
function handle<E extends C2SEvent>(
  socket: IoSocket,
  event: E,
  fn: (payload: C2SPayload<E>) => AckOf<E>,
): void {
  const raw = socket as unknown as {
    on(event: string, listener: (payload: unknown, ack: unknown) => void): void;
  };
  raw.on(event, (payload, ack) => {
    if (typeof ack !== 'function') return;
    const parsed = c2sSchemas[event].safeParse(payload);
    if (!parsed.success) {
      ack({ ok: false, error: 'badPayload' });
      return;
    }
    try {
      ack(fn(parsed.data as C2SPayload<E>));
    } catch (err) {
      console.error(`[${event}] handler failed`, err);
      ack({ ok: false, error: 'internal' });
    }
  });
}

export function registerHandlers(io: IoServer, deps: HandlerDeps): void {
  io.on('connection', (socket) => {
    handle(socket, 'sys:ping', () => ({ ok: true, serverNow: deps.now() }));
  });
}
