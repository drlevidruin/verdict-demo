import { useState } from 'react';
import { Brand } from '../components';
import { rememberedPlayerName } from './Home';

interface Props {
  secure: boolean;
  code?: string;
  busy: boolean;
  error: string | null;
  expired?: boolean;
  onJoin: (name: string) => void;
  onDismiss: () => void;
  onOpenWorkingInvite?: () => void;
}

export function Invite({ secure, code, busy, error, expired = false, onJoin, onDismiss, onOpenWorkingInvite }: Props) {
  const [name, setName] = useState(rememberedPlayerName);
  return (
    <div className="app invite-shell">
      <Brand small />
      <main className="center">
        <form className="card invite-card stack" onSubmit={(event) => {
          event.preventDefault();
          if (!expired && !busy && name.trim()) onJoin(name.trim());
        }}>
          <div>
            <p className="prompt-kicker">A friend invited you</p>
            <h1>{expired ? 'This invitation expired' : 'Join their game'}</h1>
            <p className="muted">{expired
              ? 'This fictional invitation cannot open a room. Use the working demo invitation below to inspect the join flow.'
              : 'You’ll get opposite sides of a debate and 60 seconds to write, then explore a fixed, prewritten sample verdict.'}</p>
            {!secure && <p className="invite-code">Game code: <b>{code}</b></p>}
          </div>
          <label className="field">Your name
            <input required value={name} maxLength={20} autoComplete="nickname" placeholder="e.g. Alex" disabled={busy}
              onChange={(event) => {
                event.target.setCustomValidity(event.target.value.trim() ? '' : 'Enter your name to play.');
                setName(event.target.value);
              }} />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          {expired ? (
            <button className="primary huge" type="button" onClick={onOpenWorkingInvite}>Open working demo invite</button>
          ) : (
            <button className="primary huge" type="submit" disabled={busy}>{busy ? 'Joining...' : 'Join game'}</button>
          )}
          <p className="play-entry__hint">{expired ? 'The expired invitation cannot be joined.' : 'The timer starts after you both tap Ready.'}</p>
        </form>
        <button className="quiet" type="button" disabled={busy} onClick={onDismiss}>
          {error ? 'Back to home' : 'Not now'}
        </button>
      </main>
    </div>
  );
}
