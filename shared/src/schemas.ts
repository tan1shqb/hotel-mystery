import { z } from 'zod';
import { ROOM_CODE_ALPHABET, ROOM_CODE_LENGTH } from './constants';
import type { RoomCode } from './ids';

const roomCodePattern = new RegExp(`^[${ROOM_CODE_ALPHABET}]{${ROOM_CODE_LENGTH}}$`);

/** Accepts any case and normalises to upper case. */
export const RoomCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(roomCodePattern)
  .transform((s) => s as RoomCode);

export const PingPayloadSchema = z.object({}).strict();

/**
 * One schema per client→server event. The server validates every payload
 * against this map before it reaches game logic.
 */
export const c2sSchemas = {
  'sys:ping': PingPayloadSchema,
} as const;

export type C2SPayload<E extends keyof typeof c2sSchemas> = z.infer<(typeof c2sSchemas)[E]>;
