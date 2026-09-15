import { HOSTED_CONFIG } from '../shared/hostedConfig';
import type { HostedSource, HostedTopicInput } from '../shared/hostedTypes';

interface Props {
  value: HostedTopicInput;
  onChange: (value: HostedTopicInput) => void;
}

function sourceId(): string {
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function TopicEditor({ value, onChange }: Props) {
  const setPosition = (
    key: 'positionA' | 'positionB',
    field: 'text' | 'attribution',
    next: string,
  ) => {
    onChange({
      ...value,
      [key]: {
        ...value[key],
        [field]: field === 'attribution' ? next || null : next,
      },
    });
  };

  const setSource = (index: number, patch: Partial<HostedSource>) => {
    onChange({
      ...value,
      sources: value.sources.map((source, sourceIndex) =>
        sourceIndex === index ? { ...source, ...patch } : source,
      ),
    });
  };

  return (
    <div className="hosted-topic-editor stack">
      <fieldset className="hosted-segmented">
        <legend>Topic type</legend>
        <button
          type="button"
          className={value.type === 'proposition' ? 'active' : ''}
          onClick={() => onChange({ ...value, type: 'proposition' })}
        >
          Proposition
        </button>
        <button
          type="button"
          className={value.type === 'twoPosition' ? 'active' : ''}
          onClick={() => onChange({ ...value, type: 'twoPosition' })}
        >
          Two positions
        </button>
      </fieldset>

      <label className="field hosted-field">
        {value.type === 'proposition' ? 'Claim or question' : 'Question or case'}
        <textarea
          dir="auto"
          rows={2}
          maxLength={HOSTED_CONFIG.MAX_QUESTION_CHARS}
          value={value.question}
          onChange={(event) => onChange({ ...value, question: event.target.value })}
          placeholder={
            value.type === 'proposition'
              ? 'Should homework be optional?'
              : 'Which approach better explains this case?'
          }
        />
      </label>

      <div className="hosted-position-grid">
        {(['positionA', 'positionB'] as const).map((key, index) => (
          <div className="hosted-position-card" key={key}>
            <h3>
              {value.type === 'proposition'
                ? index === 0
                  ? 'FOR position'
                  : 'AGAINST position'
                : `Position ${index === 0 ? 'A' : 'B'}`}
            </h3>
            <label className="field hosted-field">
              Position text
              <textarea
                dir="auto"
                rows={3}
                maxLength={HOSTED_CONFIG.MAX_POSITION_CHARS}
                value={value[key].text}
                onChange={(event) => setPosition(key, 'text', event.target.value)}
                placeholder="Write the exact position participants will defend"
              />
            </label>
            <label className="field hosted-field">
              Attribution, optional
              <input
                dir="auto"
                maxLength={HOSTED_CONFIG.MAX_ATTRIBUTION_CHARS}
                value={value[key].attribution ?? ''}
                onChange={(event) => setPosition(key, 'attribution', event.target.value)}
                placeholder="Team A, policy, customer research..."
              />
            </label>
          </div>
        ))}
      </div>

      <div className="hosted-sources-head">
        <div>
          <h3>Sources and evidence</h3>
          <p>Paste each source separately. Participants on both sides will see them.</p>
        </div>
        {value.sources.length < HOSTED_CONFIG.MAX_SOURCES && (
          <button
            type="button"
            className="ghost hosted-compact-button"
            onClick={() =>
              onChange({
                ...value,
                sources: [...value.sources, { id: sourceId(), label: null, text: '' }],
              })
            }
          >
            Add a source
          </button>
        )}
      </div>

      {value.sources.length === 0 ? (
        <p className="hosted-empty">No sources added. Source use will not be scored.</p>
      ) : (
        value.sources.map((source, index) => (
          <div className="hosted-source-editor" key={source.id}>
            <div className="hosted-source-editor__head">
              <strong>Source {index + 1}</strong>
              <button
                type="button"
                className="quiet"
                onClick={() =>
                  onChange({
                    ...value,
                    sources: value.sources.filter((_, sourceIndex) => sourceIndex !== index),
                  })
                }
              >
                Remove
              </button>
            </div>
            <label className="field hosted-field">
              Label, optional
              <input
                dir="auto"
                maxLength={HOSTED_CONFIG.MAX_SOURCE_LABEL_CHARS}
                value={source.label ?? ''}
                onChange={(event) => setSource(index, { label: event.target.value || null })}
                placeholder="Mishnah, source 1, policy excerpt..."
              />
            </label>
            <label className="field hosted-field">
              Source text
              <textarea
                dir="auto"
                rows={5}
                maxLength={HOSTED_CONFIG.MAX_SOURCE_CHARS}
                value={source.text}
                onChange={(event) => setSource(index, { text: event.target.value })}
              />
            </label>
          </div>
        ))
      )}
    </div>
  );
}
