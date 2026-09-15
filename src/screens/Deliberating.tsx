interface Props {
  showRetry: boolean;
  longWait: boolean;
  onRetry: () => void;
}

export function Deliberating({ showRetry, longWait, onRetry }: Props) {
  return (
    <div className="app">
      <div className="deliberate">
        <div className="gavel" aria-hidden>
          &#128296;
        </div>
        <h2>The judge is deciding...</h2>
        {showRetry ? (
          <>
            <p className="error" aria-live="polite">
              The verdict is taking longer than expected. Your arguments are still safe.
            </p>
            <button className="primary" onClick={onRetry}>
              Try again
            </button>
          </>
        ) : (
          <p className="muted" role="status">
            {longWait
              ? 'Still comparing both arguments. Keep this page open.'
              : 'Comparing both arguments. This usually takes a moment.'}
          </p>
        )}
      </div>
    </div>
  );
}
