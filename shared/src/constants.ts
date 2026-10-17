/** All game tunables live here. */

export const DEFAULT_PORT = 3000;

/** Consonants only, so random codes can't spell words. */
export const ROOM_CODE_ALPHABET = 'BCDFGHJKLMNPQRSTVWXZ';
export const ROOM_CODE_LENGTH = 4;

export const MIN_SEATS = 4;
export const MAX_SEATS = 8;
export const DEFAULT_SEATS = 5;

/** Client clock-sync / liveness ping. */
export const PING_INTERVAL_MS = 5_000;
export const PING_TIMEOUT_MS = 3_000;
