import type { C2SPayload, c2sSchemas } from './schemas';

export type ErrorCode =
  | 'badPayload'
  | 'internal'
  | 'noRoom'
  | 'roomFull'
  | 'wrongPhase'
  | 'notHost'
  | 'notAllowed'
  | 'cooldown'
  | 'notAlone'
  | 'unreachable'
  | 'locked'
  | 'occupied'
  | 'notHere'
  | 'alreadyVoted'
  | 'rateLimited';

export type AckResult<T extends object = object> =
  ({ ok: true } & T) | { ok: false; error: ErrorCode };
export type Ack<T extends object = object> = (res: AckResult<T>) => void;

export interface ClientToServerEvents {
  'sys:ping': (p: C2SPayload<'sys:ping'>, ack: Ack<{ serverNow: number }>) => void;
}

// Compile-time check: every event has a schema and every schema has an event.
type _SchemasMatchEvents = [keyof ClientToServerEvents] extends [keyof typeof c2sSchemas]
  ? [keyof typeof c2sSchemas] extends [keyof ClientToServerEvents]
    ? true
    : never
  : never;
export const _schemasMatchEvents: _SchemasMatchEvents = true;

/** `view` and `fx` arrive in M1+. */
export type ServerToClientEvents = Record<never, never>;

export type C2SEvent = keyof ClientToServerEvents;
export type AckOf<E extends C2SEvent> = Parameters<Parameters<ClientToServerEvents[E]>[1]>[0];
