import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../shared/config';
import type {
  CategoryScores,
  DebaterLabel,
  RoomDoc,
  RoundDoc,
  VerdictArgument,
  ResultFeedbackRating,
  ResultFeedbackResponse,
} from '../shared/types';
import { Brand } from '../components';
import { ResultResponse } from '../components/ResultResponse';

interface Props {
  room: RoomDoc;
  round: RoundDoc & { id: string };
  uid: string;
  opponentUid: string | null;
  readyCount: number;
  iAmReady: boolean;
  busy: boolean;
  error: string | null;
  onPlayAgain: () => void;
  onChangeTopic?: () => void;
  onSubmitFeedback?: (rating: ResultFeedbackRating, issue: string) => Promise<void>;
  resultResponse?: ResultFeedbackResponse | null;
  onLeave: () => void;
}

const CATS: (keyof CategoryScores)[] = ['clarity', 'persuasion', 'relevance', 'style'];
const EN_DASH = '–';
const ROUND_SCORE_MAX = CATS.length * 10;

function ArgumentCard({
  arg,
  claim,
  remark,
  isWinner,
  isMe,
}: {
  arg: VerdictArgument;
  claim: string;
  remark: string;
  isWinner: boolean;
  isMe: boolean;
}) {
  return (
    <div className={`arg-card ${isWinner ? 'winner-card' : ''}`}>
      <div className="arg-head">
        <span className="arg-name">
          {arg.name}
          {isMe ? ' (you)' : ''}
        </span>
        {isWinner && (
          <span className="arg-win-tag">
            <span aria-hidden>{'\u{1F3C6}'}</span> Winner
          </span>
        )}
      </div>
      {/* The exact claim this player was assigned, so the reader never has to
          reverse-engineer sides from TRUE/FALSE labels. */}
      <p className="arg-claim">Argued: &ldquo;{claim}&rdquo;</p>
      {arg.text.trim().length > 0 ? (
        <p className="arg-text">{arg.text}</p>
      ) : (
        <p className="arg-text empty">(no argument submitted)</p>
      )}
      <p className="remark">{remark}</p>
    </div>
  );
}

export function VerdictScreen({
  room,
  round,
  uid,
  opponentUid,
  iAmReady,
  busy,
  error,
  onPlayAgain,
  onChangeTopic,
  onSubmitFeedback,
  resultResponse = null,
  onLeave,
}: Props) {
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  // The live region mounts empty and is filled just after paint, so screen
  // readers reliably announce the verdict as a change (a region that is
  // already populated on first render is often skipped).
  const [liveMsg, setLiveMsg] = useState('');

  const v = round.verdict!;
  const myLabel: DebaterLabel = round.debaterA === uid ? 'A' : 'B';

  const iWon = v.winnerUid === uid;
  const isTie = v.winner === 'TIE';
  const tone = isTie ? 'tie' : iWon ? 'win' : 'lose';

  // Round totals and match score, always from THIS player's perspective (own
  // number first), so the card never asks the reader to work out which side
  // they were.
  const myTotal = v.totals ? v.totals[myLabel === 'A' ? 'a' : 'b'] : null;
  const oppTotal = v.totals ? v.totals[myLabel === 'A' ? 'b' : 'a'] : null;

  const myName = room.players[uid]?.name ?? 'You';
  const oppName = opponentUid ? room.players[opponentUid]?.name ?? 'the other side' : 'the other side';
  const myScore = room.scores[uid] ?? 0;
  const oppScore = opponentUid ? room.scores[opponentUid] ?? 0 : 0;

  const matchWinner = room.matchWinner ?? null;
  const iAmMatchWinner = !!(matchWinner && matchWinner.uid === uid);

  const claimA = round.claimPro ?? round.topicText;
  const claimB = round.claimCon ?? round.topicText;

  const capReached = room.roundCount >= CONFIG.MAX_ROUNDS_PER_ROOM;
  // The number to show counts within the current first-to-N match, not the
  // room-wide round.index (which keeps climbing across matches). Falls back to
  // round.index for rounds created before matchRoundIndex existed.
  const nextRoundNumber = (round.matchRoundIndex ?? round.index) + 1;
  const oppReady = !!(opponentUid && room.rematch[opponentUid]);
  const myScores = v.scores ? v.scores[myLabel === 'A' ? 'a' : 'b'] : null;
  const myRemark = myLabel === 'A' ? v.remarkA : v.remarkB;
  const modelNextStep = myLabel === 'A' ? v.nextStepA : v.nextStepB;
  const lowestCategory = myScores
    ? CATS.reduce((lowest, category) => myScores[category] < myScores[lowest] ? category : lowest)
    : null;
  const generalPracticeTip = lowestCategory
    ? {
        clarity: 'State your main reason earlier, then make each example serve it.',
        persuasion: 'Answer the strongest objection before the other side can use it.',
        relevance: 'Tie each reason back to your assigned position in one direct sentence.',
        style: 'Use one vivid example or comparison that makes the point easy to remember.',
      }[lowestCategory]
    : 'Build one clear reason, support it with an example, and answer the strongest objection.';
  const nextStep = modelNextStep ?? generalPracticeTip;
  const fixture = v.model === 'emulator-fixture';
  const myDq = !!(v.dq && (myLabel === 'A' ? v.dq.a : v.dq.b));

  // The single outcome sentence shown big in the result card.
  const roundOutcome = () => {
    if (v.kind === 'mistrial') return 'No verdict this round';
    if (isTie) return 'This round is a tie';
    if (v.kind === 'dq') return myDq ? 'You were disqualified' : 'You won by disqualification';
    if (v.kind === 'forfeit') return iWon ? 'You won by forfeit' : 'You lost by forfeit';
    if (myTotal !== null && oppTotal !== null) {
      return iWon ? 'You won this round' : 'You lost this round';
    }
    return iWon ? 'You won this round' : 'You lost this round';
  };
  const headline = matchWinner
    ? iAmMatchWinner
      ? `You won the match ${myScore}${EN_DASH}${oppScore}`
      : `You lost the match ${myScore}${EN_DASH}${oppScore}`
    : roundOutcome();

  // Supporting line under a match-ending headline: the decisive round's result.
  const finalRoundLine = () => {
    if (myTotal !== null && oppTotal !== null) {
      return `Final round score: ${myTotal}${EN_DASH}${oppTotal} out of ${ROUND_SCORE_MAX}`;
    }
    if (v.kind === 'dq') return `Final round: ${myDq ? 'disqualified' : 'won by disqualification'}`;
    if (v.kind === 'forfeit') return `Final round: ${iWon ? 'won by forfeit' : 'lost by forfeit'}`;
    return `Final round: ${iWon ? 'won' : 'lost'}`;
  };

  const roundSupport = (() => {
    if (myTotal !== null && oppTotal !== null) {
      return `Round score: ${myTotal}${EN_DASH}${oppTotal} out of ${ROUND_SCORE_MAX}`;
    }
    if (v.kind === 'mistrial') return 'The judge could not return a result. No match point was awarded.';
    if (isTie) return 'Neither player earned a match point this round.';
    if (v.kind === 'dq') {
      return myDq
        ? 'Your argument included instructions aimed at the judge, so it could not be scored.'
        : "Your friend's argument included instructions aimed at the judge, so it could not be scored.";
    }
    if (v.kind === 'forfeit') {
      return iWon
        ? 'Your friend submitted no argument, so no numeric score was needed.'
        : 'You submitted no argument, so no numeric score was given.';
    }
    return null;
  })();

  // One concise spoken announcement (no scoreboards, no ruling).
  const announcement = (() => {
    if (matchWinner) {
      return iAmMatchWinner
        ? `You won the match, ${myScore} to ${oppScore}.`
        : `You lost the match, ${myScore} to ${oppScore}.`;
    }
    if (v.kind === 'mistrial') return 'Mistrial. No verdict this round.';
    if (isTie) return 'This round is a tie.';
    if (v.kind === 'dq') return myDq ? 'You were disqualified.' : 'You won by disqualification.';
    if (v.kind === 'forfeit') return iWon ? 'You won by forfeit.' : 'You lost by forfeit.';
    if (myTotal !== null && oppTotal !== null) {
      return iWon ? `You won, ${myTotal} to ${oppTotal}.` : `You lost, ${myTotal} to ${oppTotal}.`;
    }
    return iWon ? 'You won this round.' : 'You lost this round.';
  })();

  // Move focus to the result heading and announce, once, when the verdict
  // appears (this screen mounts only at reveal time).
  useEffect(() => {
    headingRef.current?.focus();
    const t = setTimeout(() => setLiveMsg(announcement), 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Primary action copy: round-specific mid-match, "new match" once it is over.
  let primaryLabel: string;
  let statusLine: string | null = null;
  if (matchWinner) {
    primaryLabel = iAmReady ? 'Waiting for the other player...' : 'Start a new match';
    if (!iAmReady && oppReady) statusLine = `${oppName} wants to start a new match.`;
  } else {
    primaryLabel = iAmReady ? 'Waiting for the other player...' : `Ready for Round ${nextRoundNumber}`;
    if (iAmReady) statusLine = `You're ready for Round ${nextRoundNumber}.`;
    else if (oppReady) statusLine = `${oppName} is ready for Round ${nextRoundNumber}.`;
  }

  const share = async () => {
    const winnerLine = isTie
      ? 'It ended in a tie.'
      : `${v.winner === 'A' ? v.args.a.name : v.args.b.name} won.`;
    const text = `VERDICT on "${round.topicText}"\n${winnerLine}\n\n"${v.ruling}"\n\nTwo sides. Sixty seconds. One verdict.`;
    const url = `${window.location.href.split('#')[0]}#game/verdict`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Verdict', text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  return (
    <div className="app verdict verdict-shell">
      <header className="game-header"><Brand small /></header>
      <main className="verdict-layout">
      <section className="verdict-main">
      {/* One concise, polite announcement. Not the hero, not the ruling. */}
      <p className="sr-only" role="status" aria-live="polite">
        {liveMsg}
      </p>

      {/* The single result surface: the only place the outcome and its score
          are celebrated. Thick border + hard shadow + gold only here. */}
      <section className={`result-card ${tone}`}>
        <p className="result-topic">&ldquo;{round.topicText}&rdquo;</p>
        {fixture && <p className="result-fixture-label">Prewritten demo result · not a grade of your writing</p>}
        <h1 className="result-outcome" ref={headingRef} tabIndex={-1}>
          {matchWinner && iAmMatchWinner && (
            <span className="result-trophy" aria-hidden>
              {'\u{1F3C6}'}{' '}
            </span>
          )}
          {headline}
        </h1>
        {matchWinner ? (
          <p className="result-support">{finalRoundLine()}</p>
        ) : roundSupport ? (
          <p className="result-support">{roundSupport}</p>
        ) : null}
        <p className="result-why">{v.ruling}</p>
        {v.scoreTieAdjusted && (
          <p className="result-score-note">
            AI scores tied. Verdict applied its tiebreak and a one-point adjustment.
          </p>
        )}
      </section>

      {/* Persistent, flat match scoreboard: first-to-N, your name first. */}
      <div className="match-strip" role="group" aria-label="Match score">
        <span className="ms-label">Match · first to {CONFIG.MATCH_TARGET_WINS}</span>
        <span className="ms-dot" aria-hidden>
          &middot;
        </span>
        <span className="ms-score">
          {myName} <b>{myScore}</b>
          <span className="ms-sep" aria-hidden>
            {EN_DASH}
          </span>
          <b>{oppScore}</b> {oppName}
        </span>
      </div>

      {/* The one primary action, directly under the result where a thumb
          expects it. */}
      {capReached ? (
        <p className="muted">
          The courthouse is closed for the day. This room has reached its{' '}
          {CONFIG.MAX_ROUNDS_PER_ROOM}-round limit. Start a fresh game to keep playing.
        </p>
      ) : (
        <>
          <button className="primary huge" disabled={busy || iAmReady} onClick={onPlayAgain}>
            {primaryLabel}
          </button>
          {statusLine && (
            <p className="muted" role="status">
              {statusLine}
            </p>
          )}
        </>
      )}

      </section>
      <aside className="verdict-details">
      {room.selectedTopic && !capReached && (
        <section className="up-next">
          <p className="prompt-kicker">{matchWinner ? 'Play again' : 'Next round'}</p>
          <h3>{room.selectedTopic.title}</h3>
          {onChangeTopic && !iAmReady && <button className="quiet" onClick={onChangeTopic} disabled={busy}>Choose another debate</button>}
        </section>
      )}
      <details className="disclosure feedback-disclosure">
        <summary className="disclosure-summary"><span>{v.kind === 'judged' ? 'See your feedback' : 'Round details'}</span><span className="disclosure-chevron" aria-hidden>&#8250;</span></summary>
        <div className="disclosure-body stack">
          {v.kind === 'judged' && (
            <section className="feedback-card" aria-label="Your argument feedback">
              <div className="feedback-card__head"><h2>A thought for next time</h2></div>
              {fixture && <span className="fixture-label">Prewritten demo feedback</span>}
              <div className="feedback-point feedback-point--strength"><span>What landed</span><p>{myRemark}</p></div>
              <div className="feedback-point feedback-point--next"><span>{modelNextStep ? 'Try this' : 'General practice tip'}</span><p>{nextStep}</p></div>
            </section>
          )}
      {/* Secondary detail, collapsed by default: flat, restrained, no gold. */}
      {v.scores && (
        <details className="disclosure">
          <summary className="disclosure-summary">
            <span>Score breakdown</span>
            <span className="disclosure-chevron" aria-hidden>
              &#8250;
            </span>
          </summary>
          <div className="disclosure-body">
            <table className="cats-table">
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col">{v.args.a.name}</th>
                  <th scope="col">{v.args.b.name}</th>
                </tr>
              </thead>
              <tbody>
                {CATS.map((cat) => {
                  const a = v.scores!.a[cat];
                  const b = v.scores!.b[cat];
                  return (
                    <tr key={cat}>
                      <th scope="row">{cat}</th>
                      <td className={a >= b ? 'hi' : ''}>{a}</td>
                      <td className={b >= a ? 'hi' : ''}>{b}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      )}

      <details className="disclosure">
        <summary className="disclosure-summary">
          <span>Read both arguments</span>
          <span className="disclosure-chevron" aria-hidden>
            &#8250;
          </span>
        </summary>
        <div className="disclosure-body stack">
          <ArgumentCard
            arg={v.args.a}
            claim={claimA}
            remark={v.remarkA}
            isWinner={v.winner === 'A'}
            isMe={myLabel === 'A'}
          />
          <ArgumentCard
            arg={v.args.b}
            claim={claimB}
            remark={v.remarkB}
            isWinner={v.winner === 'B'}
            isMe={myLabel === 'B'}
          />
        </div>
      </details>

      {v.kind === 'judged' && onSubmitFeedback && <ResultResponse response={resultResponse} onSubmit={onSubmitFeedback} />}
        </div>
      </details>
      </aside>
      </main>

      {/* Quiet tertiary actions. */}
      <div className="row tertiary">
        {round.topicKind !== 'custom' && (
          <button className="quiet" onClick={share}>
            Share verdict
          </button>
        )}
        <button className="quiet" onClick={onLeave} disabled={busy}>
          Leave game
        </button>
      </div>

      {error && (
        <p className="error" aria-live="polite">
          {error}
        </p>
      )}
      {copied && (
        <div className="toast" role="status" aria-live="polite">
          Copied to clipboard
        </div>
      )}
    </div>
  );
}
