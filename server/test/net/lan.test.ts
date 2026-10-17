import type { NetworkInterfaceInfo } from 'node:os';
import { describe, expect, it } from 'vitest';
import { pickLanAddresses } from '../../src/net/lan';

const v4 = (address: string, internal = false) =>
  ({ address, family: 'IPv4', internal, netmask: '', mac: '', cidr: null }) as NetworkInterfaceInfo;
const v6 = (address: string) =>
  ({
    address,
    family: 'IPv6',
    internal: false,
    netmask: '',
    mac: '',
    cidr: null,
    scopeid: 0,
  }) as NetworkInterfaceInfo;

describe('pickLanAddresses', () => {
  it('drops loopback, link-local and IPv6, and puts private ranges first', () => {
    expect(
      pickLanAddresses({
        lo0: [v4('127.0.0.1', true)],
        utun0: [v4('100.64.0.2')],
        en0: [v4('192.168.1.23'), v6('fe80::1')],
        bridge: [v4('169.254.10.1')],
        en1: [v4('172.20.10.4')],
      }),
    ).toEqual(['192.168.1.23', '172.20.10.4', '100.64.0.2']);
  });

  it('handles empty or missing interface lists', () => {
    expect(pickLanAddresses({ en0: undefined })).toEqual([]);
  });
});
