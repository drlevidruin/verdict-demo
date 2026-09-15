import { useMemo, useState } from 'react';
import { Brand } from '../components';
import { TOPICS, TOPIC_CATEGORIES } from '../shared/topics';
import type { TopicSelectionInput } from '../shared/types';

interface Props {
  title?: string;
  confirmLabel?: string;
  introduction?: string;
  busy: boolean;
  error: string | null;
  onConfirm: (selection: TopicSelectionInput) => void;
  onBack: () => void;
}

const STARTING_COUNT = 6;

export function TopicLibrary({
  title = 'Pick a debate',
  confirmLabel = 'Play this debate',
  introduction = 'Choose a topic, then invite your friend. We’ll assign your sides when you start.',
  busy,
  error,
  onConfirm,
  onBack,
}: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('Featured');
  const [custom, setCustom] = useState({ question: '', positionA: '', positionB: '', context: '' });

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    const matches = TOPICS.filter((topic) => {
      const eligible =
        topic.visibility === 'public' &&
        topic.editorialStatus === 'published' &&
        topic.allowedModes.includes('quickPlay');
      const categoryMatch = category === 'All' || (category === 'Featured' ? !!needle || topic.featured : topic.category === category);
      const searchMatch =
        !needle ||
        `${topic.title} ${topic.text} ${topic.counter} ${topic.category}`.toLocaleLowerCase().includes(needle);
      return eligible && categoryMatch && searchMatch;
    });
    return !needle && category === 'Featured' ? matches.slice(0, STARTING_COUNT) : matches;
  }, [category, query]);

  const customReady =
    custom.question.trim().length > 0 &&
    custom.positionA.trim().length > 0 &&
    custom.positionB.trim().length > 0 &&
    custom.positionA.trim().toLocaleLowerCase() !== custom.positionB.trim().toLocaleLowerCase();

  const surprise = () => {
    const eligible = TOPICS.filter(
      (topic) =>
        topic.visibility === 'public' &&
        topic.editorialStatus === 'published' &&
        topic.allowedModes.includes('quickPlay'),
    );
    const fastFun = eligible.filter((topic) => topic.featured && topic.tone === 'playful');
    const pool = fastFun.length > 0 ? fastFun : eligible;
    const topic = pool[Math.floor(Math.random() * pool.length)];
    onConfirm({ kind: 'catalog', topicId: topic.id });
  };

  return (
    <div className="app topic-library">
      <Brand small />
      <header className="library-head">
        <button className="quiet back-link" onClick={onBack}>Back</button>
        <div>
          <p className="prompt-kicker">A topic for your game</p>
          <h1>{title}</h1>
          <p>{introduction}</p>
        </div>
      </header>

      <div className="library-tools">
        <label className="field search-field">Search debates
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try pizza, work, or friendship" />
        </label>
        <label className="field category-field">Category
          <select aria-label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
            {['Featured', 'All', ...TOPIC_CATEGORIES].map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
      </div>
      <div className="library-choice-row">
        <span>{visible.length} {visible.length === 1 ? 'debate' : 'debates'}</span>
        <button className="quiet library-random" type="button" disabled={busy} onClick={surprise}>Surprise me</button>
      </div>

      {visible.length > 0 ? (
        <div className="topic-grid">
          {visible.map((topic) => (
            <button
              className="topic-choice"
              type="button"
              disabled={busy}
              onClick={() => onConfirm({ kind: 'catalog', topicId: topic.id })}
              key={topic.id}
            >
              <span className="topic-choice__category">{topic.category}</span>
              <span className="topic-choice__title">{topic.title}</span>
              <span className="topic-choice__action">{confirmLabel}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <strong>No debates found.</strong>
          <p>Try another word or category.</p>
        </div>
      )}

      <details className="custom-topic card stack">
        <summary>
          Make your own debate <span className="custom-topic__privacy">Private to your game</span>
        </summary>
        <div className="stack">
          <div>
            <span className="privacy-badge">Private to this room</span>
            <h2>Write your own debate</h2>
          </div>
          <label className="field">Question
            <input maxLength={140} value={custom.question} onChange={(event) => setCustom({ ...custom, question: event.target.value })} placeholder="What should we debate?" />
          </label>
          <label className="field">Position A
            <textarea rows={2} maxLength={180} value={custom.positionA} onChange={(event) => setCustom({ ...custom, positionA: event.target.value })} placeholder="The exact position one player will defend" />
          </label>
          <label className="field">Position B
            <textarea rows={2} maxLength={180} value={custom.positionB} onChange={(event) => setCustom({ ...custom, positionB: event.target.value })} placeholder="A credible opposing position" />
          </label>
          <label className="field">Brief context <span className="field-optional">optional</span>
            <textarea rows={2} maxLength={280} value={custom.context} onChange={(event) => setCustom({ ...custom, context: event.target.value })} placeholder="A detail both players should know" />
          </label>
          <button
            className="primary huge"
            disabled={!customReady || busy}
            onClick={() => onConfirm({ kind: 'custom', ...custom })}
          >
            {busy ? 'Starting your game...' : confirmLabel}
          </button>
        </div>
      </details>

      {error && <p className="error" aria-live="polite">{error}</p>}
    </div>
  );
}
