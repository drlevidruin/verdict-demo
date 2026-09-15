import { useState } from 'react';
import { Brand } from '../components';
import type { RoomDoc } from '../shared/types';

interface Props {
  code: string;
  inviteToken?: string;
  room: RoomDoc;
  uid: string;
  readyCount: number;
  iAmReady: boolean;
  busy: boolean;
  error: string | null;
  onReady: () => void;
  onDemoAdvance?: () => void;
  onChangeTopic?: () => void;
  onLeave: () => void;
}

export function Lobby({ code, inviteToken, room, uid, readyCount, iAmReady, busy, error, onReady, onDemoAdvance, onChangeTopic, onLeave }: Props) {
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const players = room.playerOrder.map((p) => ({ uid: p, name: room.players[p]?.name ?? '' }));
  const full = players.length >= 2;
  const opponentReady = players.some((player) => player.uid !== uid && !!room.rematch[player.uid]);
  const readyHeading = iAmReady
    ? "You're ready."
    : opponentReady
      ? 'Your friend is ready.'
      : 'Ready to begin?';
  const readyIntro = iAmReady
    ? 'Waiting for your friend. Your side and the 60-second timer appear when you are both ready.'
    : 'Tap Ready when you are set. You will each get an opposite side and 60 seconds to write.';
  const inviteUrl = inviteToken
    ? `${window.location.href.split('#')[0]}#game/invite`
    : null;

  const copyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setShareStatus('Demo invitation copied. It opens a separate fictional walkthrough, not this room.');
    } catch (error) {
      setManualOpen(true);
      setShareStatus('Copying is unavailable here. The fictional room code is shown below.');
    }
  };

  return (
    <div className="app lobby-shell">
      <header className="game-header">
        <Brand small />
        <button className="quiet" onClick={onLeave} disabled={busy}>Leave room</button>
      </header>
      <main className="lobby-layout">
        <section className="lobby-case" aria-label="Selected debate">
          <p className="prompt-kicker">Your debate</p>
          <h1>{room.selectedTopic?.title ?? 'A surprise is on its way.'}</h1>
          {room.selectedTopic && (
            <>
              {room.selectedTopic.visibility === 'room-private' && <span className="privacy-badge">Private to this room</span>}
              {room.selectedTopic.context && <p className="lobby-topic__context">{room.selectedTopic.context}</p>}
              <details className="lobby-positions">
                <summary>See both sides</summary>
                <div className="position-preview position-preview--a"><span>One side</span><p>{room.selectedTopic.positionA}</p></div>
                <div className="position-preview position-preview--b"><span>The other side</span><p>{room.selectedTopic.positionB}</p></div>
              </details>
              {onChangeTopic && <button className="quiet" onClick={onChangeTopic} disabled={busy || iAmReady}>Change debate</button>}
            </>
          )}
        </section>
        <aside className="lobby-side">
          <h2>{full ? readyHeading : 'Add the second player.'}</h2>
          <p className="lobby-intro">{full ? readyIntro : 'Advance the walkthrough with Maya, or copy a link to the separate invitation screen.'}</p>
          {!full && onDemoAdvance && <button className="primary huge" onClick={onDemoAdvance} disabled={busy}>Simulate Maya joining</button>}
          {!full && <button className="quiet" onClick={inviteUrl ? copyInvite : () => setManualOpen(true)} disabled={busy}>{inviteUrl ? 'Copy demo invitation' : 'Show fictional room code'}</button>}
          {!full && shareStatus && <p className="muted" role="status">{shareStatus}</p>}
          {!full && (
            <details className="lobby-manual" open={manualOpen} onToggle={(event) => setManualOpen(event.currentTarget.open)}>
              <summary>Use a room code</summary>
              <div className="room-tag">Room code <span className="code-pill">{code}</span></div>
              <p className="muted">Your friend can enter this from the home screen.</p>
            </details>
          )}
          <div className="players" aria-live="polite">
            {[0, 1].map((i) => {
              const player = players[i];
              if (!player) return <div key={i} className="player-row empty"><span>Waiting for your friend...</span></div>;
              const isReady = !!room.rematch[player.uid];
              return <div key={player.uid} className="player-row"><span>{player.name}{player.uid === uid ? ' (you)' : ''}</span>{full && <span className={`ready-tag ${isReady ? 'on' : ''}`}>{isReady ? 'Ready' : 'Not ready'}</span>}</div>;
            })}
          </div>
          {full && <>
            <button className="primary huge" disabled={busy || iAmReady} onClick={onReady}>{iAmReady ? 'Waiting for your friend...' : "I'm ready"}</button>
            <p className="muted" role="status">
              {readyCount === 0
                ? 'The countdown starts when you both tap Ready.'
                : iAmReady
                  ? 'You are ready. Waiting for your friend.'
                  : 'Your friend is ready. Tap Ready to start.'}
            </p>
          </>}
          {error && <p className="error" aria-live="polite">{error}</p>}
        </aside>
      </main>
    </div>
  );
}
