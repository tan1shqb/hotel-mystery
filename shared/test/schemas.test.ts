import { describe, expect, it } from 'vitest';
import { PingPayloadSchema, RoomCodeSchema } from '../src';

describe('RoomCodeSchema', () => {
  it('accepts consonant codes and normalises case and whitespace', () => {
    expect(RoomCodeSchema.parse(' bxkq ')).toBe('BXKQ');
  });

  it.each(['BAKQ', 'BXK', 'BXKQZ', 'BX1Q', '', 'B-KQ'])('rejects %j', (code) => {
    expect(RoomCodeSchema.safeParse(code).success).toBe(false);
  });

  it('rejects non-strings', () => {
    expect(RoomCodeSchema.safeParse(1234).success).toBe(false);
  });
});

describe('PingPayloadSchema', () => {
  it('accepts an empty object only', () => {
    expect(PingPayloadSchema.safeParse({}).success).toBe(true);
    expect(PingPayloadSchema.safeParse({ extra: 1 }).success).toBe(false);
    expect(PingPayloadSchema.safeParse(null).success).toBe(false);
  });
});
