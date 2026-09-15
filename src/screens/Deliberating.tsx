interface Props {
  showRetry: boolean;
  longWait: boolean;
  onRetry: () => void;
  title?: string;
  message?: string;
  actionLabel?: string;
  onAdvance?: () => void;
}

export function Deliberating({ showRetry, longWait, onRetry, title = 'The sample judge is deciding', message, actionLabel, onAdvance }: Props) {
  return (
    <div className="app">
      <div className="deliberate">
        <div className="gavel" aria-hidden>
          &#128296;
        </div>
        <h1>{title}</h1>
        {showRetry ? (
          <>
            <p className="error" aria-live="polite">
              {message ?? 'The sample judge is unavailable. Both prewritten arguments are still safe.'}
            </p>
            <button className="primary" onClick={onRetry}>
              {actionLabel ?? 'Try sample result again'}
            </button>
          </>
        ) : (
          <p className="muted" role="status">
            {longWait
              ? 'The prewritten sample result is ready whenever you choose to continue.'
              : 'No AI call is running. Continue when you are ready to inspect the sample result.'}
          </p>
        )}
        {!showRetry && onAdvance && <button className="primary huge" onClick={onAdvance}>{actionLabel ?? 'Show prewritten sample result'}</button>}
      </div>
    </div>
  );
}
