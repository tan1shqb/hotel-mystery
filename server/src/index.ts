import { networkInterfaces } from 'node:os';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import { DEFAULT_PORT } from '@hotel/shared';
import { createApp } from './app';
import { pickLanAddresses } from './net/lan';

const port = Number(process.env.PORT ?? DEFAULT_PORT);
// Same relative path from server/src (tsx) and server/dist (built).
const staticDir = fileURLToPath(new URL('../../client/dist', import.meta.url));

const { httpServer, servesClient } = createApp({ staticDir });

httpServer.listen(port, '0.0.0.0', async () => {
  const lan = pickLanAddresses(networkInterfaces());
  const urls = lan.map((ip) => `http://${ip}:${port}`);
  console.log('\n🏨 Hotel Suspect server');
  console.log(`   Local:   http://localhost:${port}`);
  for (const url of urls) console.log(`   Network: ${url}`);
  if (!servesClient) {
    console.log('\n⚠️  client/dist not found: run `npm run build` (or use `npm run dev`).');
  }
  if (urls[0]) {
    console.log('\nScan to join from a phone on the same Wi-Fi / hotspot:\n');
    console.log(await QRCode.toString(urls[0], { type: 'terminal', small: true }));
  } else {
    console.log('\n⚠️  No network address found: connect this laptop to Wi-Fi or a hotspot.');
  }
});
