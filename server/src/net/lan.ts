import type { NetworkInterfaceInfo } from 'node:os';

const isPrivate = (ip: string) =>
  ip.startsWith('192.168.') || ip.startsWith('10.') || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);

/**
 * IPv4 addresses other devices on the Wi-Fi/hotspot can reach, private
 * ranges first. Skips loopback and link-local (169.254.x.x) addresses.
 */
export function pickLanAddresses(ifaces: NodeJS.Dict<NetworkInterfaceInfo[]>): string[] {
  const ips = Object.values(ifaces)
    .flatMap((list) => list ?? [])
    .filter((i) => (i.family === 'IPv4' || (i.family as unknown) === 4) && !i.internal)
    .map((i) => i.address)
    .filter((ip) => !ip.startsWith('169.254.'));
  const unique = [...new Set(ips)];
  return [...unique.filter(isPrivate), ...unique.filter((ip) => !isPrivate(ip))];
}
