import { FormEvent, useEffect, useState } from 'react';
import type { ResultFeedbackRating, ResultFeedbackResponse } from '../shared/types';

const ISSUE_LIMIT = 280;

export function ResultResponse({
  response,
  onSubmit,
}: {
  response: ResultFeedbackResponse | null;
  onSubmit: (rating: ResultFeedbackRating, issue: string) => Promise<void>;
}) {
  const [rating, setRating] = useState<ResultFeedbackRating | null>(null);
  const [issue, setIssue] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (!response) return;
    setRating(response.rating);
    setIssue(response.issue ?? '');
    setStatus('saved');
  }, [response]);

  const choose = (next: ResultFeedbackRating) => {
    setRating(next);
    setStatus('idle');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!rating || status === 'saving') return;
    setStatus('saving');
    try {
      await onSubmit(rating, issue);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <details className="disclosure result-response">
      <summary className="disclosure-summary">
        <span>Was this feedback fair and helpful?</span>
        <span className="disclosure-chevron" aria-hidden>&#8250;</span>
      </summary>
      <form className="result-response__form" onSubmit={(event) => void submit(event)}>
        <div className="result-response__choices" role="group" aria-label="Rate this feedback">
          <button type="button" aria-pressed={rating === 'helpful'} onClick={() => choose('helpful')}>
            Fair and helpful
          </button>
          <button type="button" aria-pressed={rating === 'unfair'} onClick={() => choose('unfair')}>
            Not helpful or fair
          </button>
          <button type="button" aria-pressed={rating === 'problem'} onClick={() => choose('problem')}>
            Report a problem
          </button>
        </div>
        {(rating === 'unfair' || rating === 'problem') && (
          <label className="result-response__issue">
            Optional note
            <textarea
              value={issue}
              maxLength={ISSUE_LIMIT}
              rows={3}
              onChange={(event) => {
                setIssue(event.target.value);
                setStatus('idle');
              }}
              placeholder="Briefly describe what felt wrong."
            />
            <span>{issue.length}/{ISSUE_LIMIT}</span>
          </label>
        )}
        <p className="result-response__privacy">
          Your choice and note stay in this demo until you refresh or reset. Nothing is sent to a judge or collected as product feedback.
        </p>
        <button className="quiet" type="submit" disabled={!rating || status === 'saving'}>
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Update response' : 'Save response'}
        </button>
        {status === 'saved' && <p className="success" role="status">Saved in this demo until refresh or reset.</p>}
        {status === 'error' && <p className="error" role="alert">We could not save that response. Try again.</p>}
      </form>
    </details>
  );
}
