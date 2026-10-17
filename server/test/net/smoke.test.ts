import type { AddressInfo } from 'node:net';
import { io as connect, type Socket } from 'socket.io-client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';

let app: ReturnType<typeof createApp>;
let url: string;
let client: Socket;

beforeEach(async () => {
  app = createApp({ now: () => 1_234 });
  await new Promise<void>((resolve) => app.httpServer.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${(app.httpServer.address() as AddressInfo).port}`;
  client = connect(url, { transports: ['websocket'], forceNew: true });
  await new Promise<void>((resolve) => client.on('connect', () => resolve()));
});

afterEach(async () => {
  client.close();
  await app.io.close();
});

describe('server smoke', () => {
  it('answers sys:ping with the server clock', async () => {
    expect(await client.emitWithAck('sys:ping', {})).toEqual({ ok: true, serverNow: 1_234 });
  });

  it('rejects malformed payloads with badPayload', async () => {
    expect(await client.emitWithAck('sys:ping', { evil: true })).toEqual({
      ok: false,
      error: 'badPayload',
    });
    expect(await client.emitWithAck('sys:ping', 'nope')).toEqual({
      ok: false,
      error: 'badPayload',
    });
  });

  it('ignores events without an ack and stays up', async () => {
    client.emit('sys:ping', {});
    expect(await client.emitWithAck('sys:ping', {})).toMatchObject({ ok: true });
  });

  it('returns 404 over HTTP when no client build is served', async () => {
    expect((await fetch(url)).status).toBe(404);
  });
});
