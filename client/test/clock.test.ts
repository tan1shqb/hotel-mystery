import { describe, expect, it } from 'vitest';
import { sampleClock, ServerClock } from '../src/net/clock';

describe('sampleClock', () => {
  it('assumes the server stamped at the midpoint of the round trip', () => {
    // sent at 1000, received at 1100 → midpoint 1050; server said 5050.
    expect(sampleClock(1_000, 5_050, 1_100)).toEqual({ offsetMs: 4_000, rttMs: 100 });
  });

  it('clamps negative RTT from a stepped local clock to zero', () => {
    expect(sampleClock(1_000, 3_000, 990).rttMs).toBe(0);
  });
});

describe('ServerClock', () => {
  it('uses zero offset with no samples', () => {
    expect(new ServerClock().serverNow(500)).toBe(500);
  });

  it('prefers the lowest-RTT sample', () => {
    const clock = new ServerClock();
    clock.add({ offsetMs: 900, rttMs: 300 });
    clock.add({ offsetMs: 1_000, rttMs: 20 });
    clock.add({ offsetMs: 1_200, rttMs: 150 });
    expect(clock.serverNow(0)).toBe(1_000);
  });

  it('forgets samples beyond its window', () => {
    const clock = new ServerClock(2);
    clock.add({ offsetMs: 1, rttMs: 1 });
    clock.add({ offsetMs: 2, rttMs: 50 });
    clock.add({ offsetMs: 3, rttMs: 60 });
    expect(clock.best).toEqual({ offsetMs: 2, rttMs: 50 });
  });
});
