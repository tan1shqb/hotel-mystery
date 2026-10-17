import { useEffect, useState } from 'react';
import { PING_INTERVAL_MS, PING_TIMEOUT_MS } from '@hotel/shared';
import { sampleClock, ServerClock } from './clock';
import { socket } from './socket';

export type ConnectionStatus = 'connecting' | 'online' | 'offline';

export const serverClock = new ServerClock();

export function useConnection() {
  const [status, setStatus] = useState<ConnectionStatus>(
    socket.connected ? 'online' : 'connecting',
  );
  const [rttMs, setRttMs] = useState<number | null>(null);

  useEffect(() => {
    const ping = () => {
      if (!socket.connected) return;
      const sentAt = Date.now();
      socket.timeout(PING_TIMEOUT_MS).emit('sys:ping', {}, (err, res) => {
        if (err || !res.ok) return;
        const sample = sampleClock(sentAt, res.serverNow, Date.now());
        serverClock.add(sample);
        setRttMs(Math.round(sample.rttMs));
      });
    };
    const onConnect = () => {
      setStatus('online');
      ping();
    };
    const onDisconnect = () => setStatus('offline');
    const onReconnecting = () => setStatus('connecting');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.io.on('reconnect_attempt', onReconnecting);
    if (socket.connected) onConnect();
    const timer = setInterval(ping, PING_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.io.off('reconnect_attempt', onReconnecting);
    };
  }, []);

  return { status, rttMs };
}
