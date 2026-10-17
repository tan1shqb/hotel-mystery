export interface ClockSample {
  offsetMs: number;
  rttMs: number;
}

/**
 * NTP-style estimate: assume the server stamped its clock halfway through the
 * round trip. offset = serverNow - local midpoint.
 */
export function sampleClock(sentAt: number, serverNow: number, receivedAt: number): ClockSample {
  const rttMs = Math.max(0, receivedAt - sentAt);
  return { offsetMs: serverNow - (sentAt + rttMs / 2), rttMs };
}

/**
 * Keeps the offset from the lowest-RTT recent sample, which is the most
 * accurate one. Server deadlines are shown as `deadline - serverNow()`.
 */
export class ServerClock {
  private samples: ClockSample[] = [];

  constructor(private readonly keep = 8) {}

  add(sample: ClockSample): void {
    this.samples.push(sample);
    if (this.samples.length > this.keep) this.samples.shift();
  }

  get best(): ClockSample | null {
    return this.samples.reduce<ClockSample | null>(
      (best, s) => (best === null || s.rttMs < best.rttMs ? s : best),
      null,
    );
  }

  serverNow(localNow: number = Date.now()): number {
    return localNow + (this.best?.offsetMs ?? 0);
  }
}
