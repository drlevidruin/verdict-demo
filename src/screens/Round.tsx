import { useRef } from 'react';
import { Brand } from '../components';
import { CONFIG } from '../shared/config';

interface Props {
  // The exact claim THIS player must argue, negation already spelled out
  // (e.g. "Cereal is a soup." vs "Cereal is not a soup."). This is the only
  // side indicator the player needs; no TRUE/FALSE labels.
  claim: string;
  index: number;
  phase: 'countdown' | 'writing';
  // True the instant the clock hits zero. Editing and locking stop
  // immediately; the grace window that follows exists only so the
  // zero-second flush can land, never for extra typing.
  timeUp: boolean;
  countdownLeft: number;
  writeLeft: number;
  timerRunning?: boolean;
  onTimerToggle?: () => void;
  draft: string;
  saveStatus: 'loading' | 'saved' | 'saving' | 'offline';
  onDraftChange: (text: string) => void;
  onDraftBlur: () => void;
  onLock: () => void;
  onLeave: () => void;
  myLocked: boolean;
  oppLocked: boolean;
  busy: boolean;
  error: string | null;
  advanceLabel?: string;
  onAdvance?: () => void;
  recoveryLabel?: string;
  onRecover?: () => void;
}

export function Round(props: Props) {
  const { claim, index, phase, timeUp, countdownLeft, writeLeft, draft } = props;

  const taRef = useRef<HTMLTextAreaElement>(null);

  if (phase === 'countdown') {
    return (
      <div className="app countdown-shell">
        <Brand small />
        <div className="center" style={{ textAlign: 'center' }}>
          <h1>Get ready to argue</h1>
          <div className="prompt-kicker">Your side</div>
          <p className="prompt-instruction">Argue that:</p>
          <div className="topic">&ldquo;{claim}&rdquo;</div>
          <div className="countdown-num" role="timer">
            {countdownLeft || 'Go'}
          </div>
          {props.onTimerToggle && <button className="primary" onClick={props.onTimerToggle}>
            {props.timerRunning ? 'Pause demo countdown' : countdownLeft < CONFIG.COUNTDOWN_SECONDS ? 'Resume demo countdown' : 'Start demo countdown'}
          </button>}
        </div>
      </div>
    );
  }

  const remaining = CONFIG.CHAR_LIMIT - draft.length;
  const low = writeLeft <= 10;

  return (
    <div className="app writing-shell">
      <header className="game-header"><Brand small /><span className="prompt-kicker">Round {index}</span></header>
      <h1 className="writing-title">Write your argument</h1>
      <main className="writing-layout">
      <section className="writing-prompt">
      {/* The assignment stays pinned in its own card the whole round. */}
      <div className="prompt-card">
        <div className="prompt-kicker">Your side</div>
        <p className="prompt-instruction">Argue that:</p>
        <div className="topic compact">&ldquo;{claim}&rdquo;</div>
      </div>

      <div className="opp-status" role="status">
        {props.oppLocked ? <span className="locked">Your friend has locked in.</span> : <span>Your friend is writing...</span>}
      </div>
      </section>
      <section className="writing-editor" aria-label="Write your case">
      <div className="timer-row" role="timer" aria-label={`${writeLeft} seconds left`}>
        <div className="timer-bar">
          <span style={{ width: `${(writeLeft / CONFIG.WRITING_SECONDS) * 100}%` }} />
        </div>
        <div className={`timer-num ${low ? 'low' : ''}`}>{writeLeft}s</div>
      </div>
      {props.onTimerToggle && !timeUp && !props.myLocked && (
        <button className="quiet timer-toggle" type="button" onClick={props.onTimerToggle}>
          {props.timerRunning ? 'Pause demo timer' : writeLeft < CONFIG.WRITING_SECONDS ? 'Resume demo timer' : 'Start 60-second demo timer'}
        </button>
      )}

      {props.myLocked || timeUp ? (
        <>
          <h2 className="section-label">Your argument</h2>
          <div className="card">
            {draft.trim().length > 0 ? (
              <p className="arg-text">{draft}</p>
            ) : (
              <p className="arg-text empty">(nothing submitted)</p>
            )}
          </div>
          <div className="opp-status" role="status">
            {props.myLocked ? (
              <>
                <span className="locked">Locked in.</span>{' '}
                {props.oppLocked ? 'Both arguments are in. Opening the verdict...' : 'Waiting for your friend to finish.'}
              </>
            ) : (
              <>
                <span className="locked">Time is up.</span> Typing is closed. You can inspect the prewritten sample result.
              </>
            )}
          </div>
          {props.onAdvance && <button className="primary huge" onClick={props.onAdvance}>{props.advanceLabel ?? 'Continue'}</button>}
        </>
      ) : (
        <>
          <textarea
            aria-label="Your argument"
            ref={taRef}
            rows={5}
            value={draft}
            maxLength={CONFIG.CHAR_LIMIT}
            onChange={(e) => props.onDraftChange(e.target.value)}
            onBlur={props.onDraftBlur}
            placeholder="Write your argument..."
            autoComplete="off"
            autoCorrect="on"
            autoCapitalize="sentences"
            spellCheck={true}
          />
          <div className="editor-status">
            <span className={`save-status save-status--${props.saveStatus}`} role="status">
              {props.saveStatus === 'loading'
                ? 'Restoring your draft...'
                : props.saveStatus === 'saved'
                ? 'Draft saved'
                : props.saveStatus === 'saving'
                  ? 'Saving draft...'
                  : 'Offline. Draft kept on this device.'}
            </span>
            <span className={`counter ${remaining <= 40 ? 'warn' : ''}`} aria-live="polite">{remaining} characters left</span>
          </div>
          <div className="lock-dock">
            <button
              className="primary huge"
              disabled={props.busy || draft.trim().length === 0}
              onClick={props.onLock}
            >
              Lock it in
            </button>
          </div>
          <p className="muted">Once you lock it in, your argument is final.</p>
        </>
      )}

      {props.error && (
        <>
          <p className="error" aria-live="polite">
            {props.error}
          </p>
          {timeUp && !props.myLocked && (
            <button className="ghost" onClick={props.onLeave} disabled={props.busy}>
              Leave game
            </button>
          )}
        </>
      )}
      {props.onRecover && <button className="primary huge" onClick={props.onRecover}>{props.recoveryLabel ?? 'Try again'}</button>}
      </section>
      </main>
    </div>
  );
}
