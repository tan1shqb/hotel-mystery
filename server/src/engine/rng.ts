/**
 * Seeded PRNG (mulberry32). The state is a plain uint32 so it can live inside
 * GameState and a seed fully determines a game. Every function is pure:
 * it takes the current state and returns the next one alongside the value.
 */

export type RngState = number;

export interface Rolled<T> {
  value: T;
  rng: RngState;
}

export function seedRng(seed: number): RngState {
  return seed >>> 0;
}

/** Float in [0, 1). */
export function rngFloat(rng: RngState): Rolled<number> {
  const next = (rng + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, rng: next };
}

/** Integer in [0, maxExclusive). */
export function rngInt(rng: RngState, maxExclusive: number): Rolled<number> {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError(`rngInt: maxExclusive must be a positive integer, got ${maxExclusive}`);
  }
  const { value, rng: next } = rngFloat(rng);
  return { value: Math.floor(value * maxExclusive), rng: next };
}

export function rngPick<T>(rng: RngState, items: readonly T[]): Rolled<T> {
  if (items.length === 0) throw new RangeError('rngPick: empty list');
  const { value: i, rng: next } = rngInt(rng, items.length);
  return { value: items[i] as T, rng: next };
}

/** Fisher–Yates; returns a new array and leaves the input untouched. */
export function rngShuffle<T>(rng: RngState, items: readonly T[]): Rolled<T[]> {
  const out = items.slice();
  let state = rng;
  for (let i = out.length - 1; i > 0; i--) {
    const roll = rngInt(state, i + 1);
    state = roll.rng;
    const j = roll.value;
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return { value: out, rng: state };
}
