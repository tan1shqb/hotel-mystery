import { useConnection } from './net/useConnection';

const STATUS_ICON = { connecting: '⏳', online: '🟢', offline: '🔴' } as const;

export function App() {
  const { status, rttMs } = useConnection();
  return (
    <main className="splash">
      <div className="logo" aria-hidden>
        🏨
      </div>
      <h1>Hotel Suspect</h1>
      <div className={`conn conn-${status}`} role="status" aria-label={status}>
        <span className="conn-icon">{STATUS_ICON[status]}</span>
        {status === 'online' && rttMs !== null && <span className="conn-rtt">📶 {rttMs} ms</span>}
      </div>
    </main>
  );
}
