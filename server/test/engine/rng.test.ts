import { describe, expect, it } from 'vitest';
import {
  rngFloat,
  rngInt,
  rngPick,
  rngShuffle,
  seedRng,
  type RngState,
} from '../../src/engine/rng';

function floats(seed: number, n: number): number[] {
  let rng: RngState = seedRng(seed);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const r = rngFloat(rng);
    out.push(r.value);
    rng = r.rng;
  }
  return out;
}

describe('rng', () => {
  it('is deterministic for a seed', () => {
    expect(floats(42, 50)).toEqual(floats(42, 50));
  });

  it('differs across seeds', () => {
    expect(floats(1, 10)).not.toEqual(floats(2, 10));
  });

  it('is pure: the same state always yields the same roll', () => {
    const s = seedRng(7);
    expect(rngFloat(s)).toEqual(rngFloat(s));
  });

  it('produces floats in [0, 1) with a sane spread', () => {
    const xs = floats(123, 10_000);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThan(1);
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    expect(mean).toBeGreaterThan(0.48);
    expect(mean).toBeLessThan(0.52);
  });

  it('rngInt covers every bucket and stays in range', () => {
    let rng = seedRng(9);
    const seen = new Set<number>();
    for (let i = 0; i < 1_000; i++) {
      const r = rngInt(rng, 6);
      rng = r.rng;
      expect(r.value).toBeGreaterThanOrEqual(0);
      expect(r.value).toBeLessThan(6);
      seen.add(r.value);
    }
    expect(seen.size).toBe(6);
  });

  it('rngInt rejects invalid bounds', () => {
    expect(() => rngInt(seedRng(1), 0)).toThrow(RangeError);
    expect(() => rngInt(seedRng(1), 2.5)).toThrow(RangeError);
  });

  it('rngPick returns a member and rejects empty lists', () => {
    expect(['a', 'b', 'c']).toContain(rngPick(seedRng(3), ['a', 'b', 'c']).value);
    expect(() => rngPick(seedRng(3), [])).toThrow(RangeError);
  });

  it('rngShuffle returns a permutation without mutating the input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const { value } = rngShuffle(seedRng(5), input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...value].sort((a, b) => a - b)).toEqual(input);
    expect(rngShuffle(seedRng(5), input).value).toEqual(value);
  });
});
