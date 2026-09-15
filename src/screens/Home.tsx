import { useRef, useState } from 'react';
import { Brand } from '../components';
import { TOPICS } from '../shared/topics';
import type { TopicSelectionInput } from '../shared/types';
import { TopicLibrary } from './TopicLibrary';

interface Props {
  loading: boolean;
  error: string | null;
  onCreate: (name: string, topic: TopicSelectionInput) => void;
  onJoin: (code: string, name: string) => void;
  onPracticeWithGroup?: () => void;
  onJoinGroup?: () => void;
}

export function rememberedPlayerName(): string {
  // The public walkthrough deliberately forgets people between visits.
  return '';
}

function surpriseSelection(): TopicSelectionInput {
  const eligible = TOPICS.filter((topic) => topic.visibility === 'public' &&
    topic.editorialStatus === 'published' && topic.allowedModes.includes('quickPlay'));
  const featured = eligible.filter((topic) => topic.featured && topic.tone === 'playful');
  const pool = featured.length ? featured : eligible;
  return { kind: 'catalog', topicId: pool[Math.floor(Math.random() * pool.length)].id };
}

export function Home({ loading, error, onCreate, onJoin, onPracticeWithGroup, onJoinGroup }: Props) {
  const [name, setName] = useState(rememberedPlayerName);
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'start' | 'join'>('start');
  const [choosingTopic, setChoosingTopic] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const trimmedName = name.trim();

  const validName = () => {
    const input = formRef.current?.querySelector<HTMLInputElement>('input[name="playerName"]');
    const message = trimmedName ? '' : 'Add a name so the sample scoreboard has someone to cheer for.';
    input?.setCustomValidity(message);
    setNameError(message || null);
    if (!trimmedName) input?.focus();
    return !!trimmedName;
  };

  if (choosingTopic) return <TopicLibrary busy={loading} error={error}
    onBack={() => setChoosingTopic(false)} onConfirm={(topic) => onCreate(trimmedName, topic)} />;

  return (
    <div className="play-home-shell">
      <main className="play-home">
        <header className="play-home__header"><Brand small /></header>
        <section className="play-home__hero">
          <div className="play-home__copy">
            <p className="prompt-kicker">A debate game for two friends</p>
            <h1>A little debate.<br />A lot of fun.</h1>
            <p>You and a simulated friend get opposite sides of a fun debate. Write your argument, then explore a fixed, prewritten sample verdict.</p>
            <p className="play-home__facts">2 players · 60 seconds to write · First to 2 wins</p>
          </div>
          <div className="play-entry">
            <div className="play-entry__modes" role="group" aria-label="Start or join a game">
              <button type="button" aria-pressed={mode === 'start'} disabled={loading} onClick={() => setMode('start')}>Start a game</button>
              <button type="button" aria-pressed={mode === 'join'} disabled={loading} onClick={() => setMode('join')}>Join a game</button>
            </div>
            <form ref={formRef} className="play-entry__form" noValidate onSubmit={(event) => {
              event.preventDefault();
              if (loading || !validName()) return;
              if (mode === 'start') onCreate(trimmedName, surpriseSelection());
              else onJoin(code.trim().toUpperCase(), trimmedName);
            }}>
              <p className="play-entry__intro">{mode === 'start'
                ? 'Start here, then simulate a friend joining this browser-only room.'
                : 'Use the fictional game code DEMO to try the join flow.'}</p>
              <label className="field">Your name
                <input name="playerName" required value={name} maxLength={20} autoComplete="nickname"
                  placeholder="e.g. Alex" disabled={loading}
                  aria-describedby={nameError ? 'game-name-error' : undefined}
                  aria-invalid={!!nameError}
                  onChange={(event) => { event.target.setCustomValidity(''); setNameError(null); setName(event.target.value); }} />
              </label>
              {nameError && <p className="error" id="game-name-error" role="alert">{nameError}</p>}
              {mode === 'join' && <label className="field">Game code
                <input className="code" required pattern="[A-Za-z]{4}" title="Enter the four-letter game code."
                  value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))}
                  placeholder="ABCD" maxLength={4} autoComplete="off" autoCapitalize="characters" disabled={loading} />
              </label>}
              <button className="primary huge" type="submit" disabled={loading}>
                {loading ? (mode === 'start' ? 'Starting your game...' : 'Joining...') : (mode === 'start' ? 'Surprise me' : 'Join game')}
              </button>
              {mode === 'start' ? <>
                <p className="play-entry__hint">Pick a random debate and create your game.</p>
                <button className="quiet" type="button" disabled={loading} onClick={() => {
                  if (validName()) setChoosingTopic(true);
                }}>Choose a debate instead</button>
              </> : <p className="play-entry__hint">Have an invite link? Open it to join without a code.</p>}
              {error && <p className="error" role="alert">{error}</p>}
            </form>
          </div>
        </section>
        <footer className="play-home__footer">
          {(onPracticeWithGroup || onJoinGroup) && <span>Group practice</span>}
          {onPracticeWithGroup && <button className="quiet" type="button" disabled={loading} onClick={onPracticeWithGroup}>Host a group</button>}
          {onJoinGroup && <button className="quiet" type="button" disabled={loading} onClick={onJoinGroup}>Join a group</button>}
        </footer>
      </main>
    </div>
  );
}
