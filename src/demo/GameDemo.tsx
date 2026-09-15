import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Deliberating } from '../screens/Deliberating';
import { Home } from '../screens/Home';
import { Invite } from '../screens/Invite';
import { Lobby } from '../screens/Lobby';
import { Round } from '../screens/Round';
import { TopicLibrary } from '../screens/TopicLibrary';
import { VerdictScreen } from '../screens/Verdict';
import { TOPICS } from '../shared/topics';
import type {
  ResultFeedbackRating,
  ResultFeedbackResponse,
  RoomDoc,
  RoundDoc,
  TopicSelectionInput,
  TopicSnapshot,
  Verdict,
  VerdictKind,
} from '../shared/types';
import './game-demo.css';

type Props = {
  screen: string;
  onNavigate: (screen: string) => void;
};

type Scores = { me: number; friend: number };

const ME = 'demo-me';
const FRIEND = 'demo-friend';
const stamp = { seconds: 0, toMillis: () => 0 };
const fallbackTopic = TOPICS.find((topic) => topic.id === 't03') ?? TOPICS[0];

function catalogSnapshot(topicId: string): TopicSnapshot {
  const topic = TOPICS.find((item) => item.id === topicId) ?? fallbackTopic;
  return {
    kind: 'catalog',
    id: topic.id,
    version: topic.version,
    title: topic.title,
    question: topic.text,
    positionA: topic.text,
    positionB: topic.counter,
    category: topic.category,
    context: null,
    visibility: 'public',
  };
}

function snapshotFromSelection(selection: TopicSelectionInput): TopicSnapshot {
  if (selection.kind === 'custom') {
    return {
      kind: 'custom',
      id: 'demo-custom',
      version: 1,
      title: selection.question,
      question: selection.question,
      positionA: selection.positionA,
      positionB: selection.positionB,
      category: 'Custom debate',
      context: selection.context?.trim() || null,
      visibility: 'room-private',
    };
  }
  if (selection.kind === 'catalog') return catalogSnapshot(selection.topicId);
  return catalogSnapshot(fallbackTopic.id);
}

function cannedVerdict(
  topic: TopicSnapshot,
  name: string,
  index: number,
  variant: VerdictKind | 'tie' = 'judged',
): Verdict {
  const friendWins = index === 2;
  const winner = variant === 'tie' ? 'TIE' : friendWins ? 'B' : 'A';
  const isSpecial = variant !== 'judged' && variant !== 'tie';
  const myText = topic.id === 't03'
    ? 'Pineapple belongs on pizza because its bright sweetness balances salty cheese and tomato. Sweet and savory combinations already work in barbecue and chutney, so pizza can handle the same contrast.'
    : `“${topic.positionA}” is the stronger position because it creates a clear, practical rule people can understand. The opposing view has exceptions, but those exceptions do not outweigh the everyday benefit.`;
  const friendText = topic.id === 't03'
    ? 'Pineapple does not belong on pizza because its juice softens the crust and overpowers the sauce. Pizza toppings should add savoriness and texture, not turn each bite into a sweet snack.'
    : `“${topic.positionB}” better fits real life because a flexible response handles more situations. A simple rule sounds appealing, but it breaks down when circumstances and people differ.`;

  const scores = isSpecial ? null : variant === 'tie' ? {
    a: { clarity: 8, persuasion: 8, relevance: 8, style: 8 },
    b: { clarity: 8, persuasion: 8, relevance: 8, style: 8 },
  } : {
    a: friendWins ? { clarity: 8, persuasion: 7, relevance: 8, style: 7 } : { clarity: 9, persuasion: 9, relevance: 8, style: 8 },
    b: friendWins ? { clarity: 9, persuasion: 8, relevance: 8, style: 8 } : { clarity: 8, persuasion: 7, relevance: 8, style: 7 },
  };
  const totals = scores ? {
    a: Object.values(scores.a).reduce((sum, value) => sum + value, 0),
    b: Object.values(scores.b).reduce((sum, value) => sum + value, 0),
  } : null;

  let kind: VerdictKind = variant === 'tie' ? 'judged' : variant;
  let winnerUid: string | null = winner === 'TIE' ? null : winner === 'A' ? ME : FRIEND;
  let ruling = winner === 'A'
    ? `${name}'s sample made a direct claim, supported it with a concrete comparison, and answered the other side's main concern.`
    : winner === 'B'
      ? `Maya's sample connected the claim to a practical consequence and handled the strongest objection more directly.`
      : 'Both sample arguments were equally clear, relevant, and persuasive, so neither side earns a match point.';
  let dq: Verdict['dq'] = null;

  if (variant === 'dq') {
    winnerUid = FRIEND;
    ruling = 'The sample submission tried to instruct the judge how to score it, so it was disqualified.';
    dq = { a: true, b: false, reason: 'Attempted judge manipulation' };
  } else if (variant === 'forfeit') {
    winnerUid = FRIEND;
    ruling = `${name}'s sample submission was empty when time expired, so Maya wins the round by forfeit.`;
  }

  return {
    kind,
    winner: variant === 'dq' || variant === 'forfeit' ? 'B' : winner,
    winnerUid,
    scores,
    totals,
    remarkA: 'The sample opens with a clear position and gives the reader a concrete reason to accept it.',
    remarkB: 'The sample anticipates the opposing case and keeps every sentence tied to the assigned side.',
    nextStepA: 'Add one specific example, then explain exactly how it proves your claim.',
    nextStepB: 'State the consequence sooner so the strongest point arrives in the opening sentence.',
    ruling,
    dq,
    winnerAdjusted: false,
    scoreTieAdjusted: variant === 'tie' ? false : undefined,
    args: {
      a: { uid: ME, name, side: 'PRO', text: variant === 'forfeit' ? '' : myText },
      b: { uid: FRIEND, name: 'Maya', side: 'CON', text: friendText },
    },
    model: 'emulator-fixture',
    promptVersion: 'public-demo-v1',
    judgedAt: stamp,
  };
}

function DemoStrip({ children, note }: { children?: ReactNode; note: string }) {
  return (
    <aside className="game-demo-strip" aria-label="Demo controls">
      <div><strong>Interactive simulation</strong><span>{note}</span></div>
      {children && <div className="game-demo-strip__actions">{children}</div>}
    </aside>
  );
}

function StateCard({
  eyebrow,
  title,
  children,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  primary: { label: string; action: () => void };
  secondary?: { label: string; action: () => void };
}) {
  return (
    <div className="app game-demo-state"><main className="card stack">
      <p className="prompt-kicker">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="muted">{children}</div>
      <button className="primary huge" onClick={primary.action}>{primary.label}</button>
      {secondary && <button className="quiet" onClick={secondary.action}>{secondary.label}</button>}
    </main></div>
  );
}

export function GameDemo({ screen, onNavigate }: Props) {
  const route = screen || 'home';
  const [name, setName] = useState('Alex');
  const [selectedTopic, setSelectedTopic] = useState<TopicSnapshot>(() => catalogSnapshot(fallbackTopic.id));
  const [friendJoined, setFriendJoined] = useState(false);
  const [iAmReady, setIAmReady] = useState(false);
  const [friendReady, setFriendReady] = useState(false);
  const [roundIndex, setRoundIndex] = useState(1);
  const [scores, setScores] = useState<Scores>({ me: 0, friend: 0 });
  const [countdownLeft, setCountdownLeft] = useState(3);
  const [writeLeft, setWriteLeft] = useState(60);
  const [draft, setDraft] = useState('');
  const [myLocked, setMyLocked] = useState(false);
  const [oppLocked, setOppLocked] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const [homeError, setHomeError] = useState<string | null>(null);
  const [resultResponse, setResultResponse] = useState<ResultFeedbackResponse | null>(null);

  const resultTopic = selectedTopic.kind === 'custom' ? catalogSnapshot(fallbackTopic.id) : selectedTopic;
  const resultScores = useMemo<Scores>(() => {
    if (roundIndex === 1) return { me: 1, friend: 0 };
    if (roundIndex === 2) return { me: 1, friend: 1 };
    return { me: 2, friend: 1 };
  }, [roundIndex]);

  const goCountdown = () => {
    setCountdownLeft(3);
    setWriteLeft(60);
    setDraft('');
    setMyLocked(false);
    setOppLocked(false);
    setSaveStatus('saved');
    onNavigate('countdown');
  };

  const resetMatch = (joined: boolean) => {
    setFriendJoined(joined);
    setIAmReady(false);
    setFriendReady(false);
    setRoundIndex(1);
    setScores({ me: 0, friend: 0 });
    setCountdownLeft(3);
    setWriteLeft(60);
    setDraft('');
    setMyLocked(false);
    setOppLocked(false);
    setSaveStatus('saved');
    setResultResponse(null);
  };

  const createRoom = (playerName: string, selection: TopicSelectionInput) => {
    setName(playerName || 'Alex');
    setSelectedTopic(snapshotFromSelection(selection));
    resetMatch(false);
    setHomeError(null);
    onNavigate('lobby');
  };

  const joinRoom = (code: string, playerName: string) => {
    if (code !== 'DEMO') {
      setHomeError('That fictional room is unavailable. Use the demo code DEMO.');
      return;
    }
    setName(playerName || 'Alex');
    resetMatch(true);
    setHomeError(null);
    onNavigate('lobby');
  };

  useEffect(() => {
    if (route !== 'countdown') return;
    const timer = window.setInterval(() => {
      setCountdownLeft((left) => Math.max(0, left - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [route]);

  useEffect(() => {
    if (route === 'countdown' && countdownLeft <= 0) onNavigate('writing');
  }, [route, countdownLeft, onNavigate]);

  useEffect(() => {
    if (route !== 'writing') return;
    const timer = window.setInterval(() => {
      setWriteLeft((left) => Math.max(0, left - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [route]);

  useEffect(() => {
    if (route !== 'writing' || writeLeft > 0) return;
    setOppLocked(true);
    onNavigate('timeup');
  }, [route, writeLeft, onNavigate]);

  useEffect(() => {
    const advance = (event: Event) => {
      const ms = Number((event as CustomEvent<number>).detail) || 0;
      const seconds = Math.max(0, ms / 1000);
      if (route === 'countdown') {
        setCountdownLeft((left) => Math.max(0, left - seconds));
      } else if (route === 'writing') {
        setWriteLeft((left) => Math.max(0, left - seconds));
      }
    };
    window.addEventListener('verdict:advance-time', advance);
    return () => window.removeEventListener('verdict:advance-time', advance);
  }, [route]);

  useEffect(() => {
    const render = () => JSON.stringify({
      demo: 'game',
      screen: route,
      topic: selectedTopic.title,
      player: name,
      friendJoined,
      ready: { player: iAmReady, friend: friendReady },
      round: roundIndex,
      countdownLeft,
      writeLeft,
      draftLength: draft.length,
      locked: { player: myLocked, friend: oppLocked },
      score: scores,
    });
    window.render_game_to_text = render;
    return () => {
      if (window.render_game_to_text === render) delete window.render_game_to_text;
    };
  }, [route, selectedTopic, name, friendJoined, iAmReady, friendReady, roundIndex, countdownLeft, writeLeft, draft, myLocked, oppLocked, scores]);

  const room = (variant: VerdictKind | 'tie' = 'judged', viewIndex = roundIndex, forceMatch = false): RoomDoc => {
    const shownScores = route === 'verdict' || route === 'verdict-loss' || route === 'match' || route === 'tie' || route === 'dq' || route === 'forfeit'
      ? variant === 'judged'
        ? viewIndex === 1 ? { me: 1, friend: 0 } : viewIndex === 2 ? { me: 1, friend: 1 } : { me: 2, friend: 1 }
        : scores
      : scores;
    return {
      code: 'DEMO',
      status: route === 'lobby' ? 'lobby' : 'playing',
      hostUid: ME,
      players: {
        [ME]: { name, joinedAt: stamp },
        ...(friendJoined || route !== 'lobby' ? { [FRIEND]: { name: 'Maya', joinedAt: stamp } } : {}),
      },
      playerOrder: friendJoined || route !== 'lobby' ? [ME, FRIEND] : [ME],
      scores: { [ME]: shownScores.me, [FRIEND]: shownScores.friend },
      rematch: { [ME]: iAmReady, [FRIEND]: friendReady },
      currentRoundId: 'sample-round',
      roundCount: viewIndex,
      usedTopicIds: [selectedTopic.id],
      lastProUid: ME,
      selectedTopic: route === 'verdict' && selectedTopic.kind === 'custom' ? resultTopic : selectedTopic,
      topicConfirmed: { [ME]: true, [FRIEND]: true },
      matchWinner: forceMatch || (route === 'verdict' && viewIndex >= 3) ? { uid: ME, name, wins: 2 } : null,
      createdAt: stamp,
      expiresAt: stamp,
    };
  };

  const round = (variant: VerdictKind | 'tie' = 'judged', viewIndex = roundIndex): RoundDoc & { id: string } => ({
    id: 'sample-round',
    index: viewIndex,
    matchRoundIndex: viewIndex,
    topicId: resultTopic.id,
    topicVersion: resultTopic.version,
    topicKind: resultTopic.kind,
    topicQuestion: resultTopic.question,
    topicCategory: resultTopic.category,
    topicContext: resultTopic.context,
    topicText: resultTopic.title,
    claimPro: resultTopic.positionA,
    claimCon: resultTopic.positionB,
    sides: { [ME]: 'PRO', [FRIEND]: 'CON' },
    debaterA: ME,
    debaterB: FRIEND,
    locked: { [ME]: true, [FRIEND]: true },
    status: 'verdict',
    createdAt: stamp,
    startsAt: stamp,
    deadlineAt: stamp,
    judging: null,
    verdict: cannedVerdict(resultTopic, name, viewIndex, variant),
    expiresAt: stamp,
  });

  const verdict = (variant: VerdictKind | 'tie' = 'judged', viewIndex = roundIndex, forceMatch = false) => (
    <>
      <DemoStrip note={selectedTopic.kind === 'custom'
        ? 'Your custom topic remains private in memory. The result below is a separate canned pineapple example, not a grade of anything you typed.'
        : 'This is a fixed, prewritten sample result. Nothing you typed was sent anywhere or graded.'} />
      <VerdictScreen
        room={room(variant, viewIndex, forceMatch)}
        round={round(variant, viewIndex)}
        uid={ME}
        opponentUid={FRIEND}
        readyCount={1}
        iAmReady={false}
        busy={false}
        error={null}
        onPlayAgain={() => {
          if (variant !== 'judged') {
            onNavigate('verdict');
            return;
          }
          if (forceMatch || viewIndex >= 3) {
            setScores({ me: 0, friend: 0 });
            setRoundIndex(1);
            onNavigate('topics');
            return;
          }
          setScores(resultScores);
          setRoundIndex(viewIndex + 1);
          goCountdown();
        }}
        onChangeTopic={() => onNavigate('topics')}
        onSubmitFeedback={async (rating: ResultFeedbackRating, issue: string) => {
          setResultResponse({
            rating,
            helpful: rating === 'helpful',
            issue: issue.trim() || null,
            createdAt: stamp,
            updatedAt: stamp,
            expiresAt: stamp,
          });
        }}
        resultResponse={resultResponse}
        onLeave={() => onNavigate('home')}
      />
    </>
  );

  if (route === 'home') return <Home loading={false} error={homeError} onCreate={createRoom} onJoin={joinRoom}
    onPracticeWithGroup={() => onNavigate('practice/groups')} onJoinGroup={() => onNavigate('practice/join')} />;

  if (route === 'invite' || route === 'invite-error') return <><DemoStrip note="This is a fictional invite. Joining adds you to room DEMO only in this browser tab." />
    <Invite secure={false} code="DEMO" busy={false} error={route === 'invite-error' ? 'This sample invite has expired. Return home or open room DEMO.' : null} onJoin={(playerName) => {
      setName(playerName || 'Alex'); setFriendJoined(true); onNavigate('lobby');
    }} onDismiss={() => onNavigate('home')} /></>;

  if (route === 'topics') return <TopicLibrary busy={false} error={null} onBack={() => onNavigate('lobby')}
    onConfirm={(selection) => { setSelectedTopic(snapshotFromSelection(selection)); onNavigate('lobby'); }} />;

  if (route === 'lobby' || route === 'lobby-full') {
    const fullPreview = route === 'lobby-full';
    const previewFriendReady = fullPreview || friendReady;
    return <>
    <DemoStrip note="Maya is a simulated friend. No invite is sent and no multiplayer connection is opened.">
      {!friendJoined && !fullPreview ? <button className="quiet" onClick={() => { setFriendJoined(true); setFriendReady(true); }}>Simulate Maya joining + ready</button>
        : !previewFriendReady ? <button className="quiet" onClick={() => { setFriendReady(true); if (iAmReady) goCountdown(); }}>Have Maya tap Ready</button>
          : <span className="game-demo-ready">Maya is ready</span>}
    </DemoStrip>
    <Lobby code="DEMO" inviteToken="fictional-demo" room={fullPreview ? { ...room(), players: { [ME]: { name, joinedAt: stamp }, [FRIEND]: { name: 'Maya', joinedAt: stamp } }, playerOrder: [ME, FRIEND], rematch: { [ME]: false, [FRIEND]: true } } : room()} uid={ME}
      readyCount={Number(iAmReady) + Number(previewFriendReady)} iAmReady={iAmReady} busy={false} error={null}
      onReady={() => { setIAmReady(true); if (previewFriendReady) goCountdown(); }}
      onChangeTopic={() => onNavigate('topics')} onLeave={() => onNavigate('home')} />
  </>;
  }

  if (route === 'countdown') return <><DemoStrip note="The three-second countdown is running locally." />
    <Round claim={selectedTopic.positionA} index={roundIndex} phase="countdown" timeUp={false}
      countdownLeft={Math.ceil(countdownLeft)} writeLeft={60} draft={draft} saveStatus="saved"
      onDraftChange={setDraft} onDraftBlur={() => undefined} onLock={() => undefined} onLeave={() => onNavigate('home')}
      myLocked={false} oppLocked={false} busy={false} error={null} /></>;

  if (route === 'writing' || route === 'offline' || route === 'timeup') {
    const isOffline = route === 'offline';
    const isTimeUp = route === 'timeup';
    return <>
      <DemoStrip note={isOffline
        ? 'Offline is simulated. Your draft remains only in component memory.'
        : 'The timer is local. The sample verdict is fixed and never grades the text below.'}>
        {!isTimeUp && <button className="quiet" onClick={() => setDraft(`“${selectedTopic.positionA}” is convincing because it gives people a clear rule and a practical benefit. A concrete example would make the case even stronger.`)}>Use sample argument</button>}
        <button className="quiet" onClick={() => { setOppLocked(true); onNavigate('deliberating'); }}>Skip to sample verdict</button>
      </DemoStrip>
      <Round claim={selectedTopic.positionA} index={roundIndex} phase="writing" timeUp={isTimeUp}
        countdownLeft={0} writeLeft={isTimeUp ? 0 : Math.ceil(writeLeft)} draft={draft}
        saveStatus={isOffline ? 'offline' : saveStatus}
        onDraftChange={(value) => { setDraft(value); setSaveStatus('saving'); window.setTimeout(() => setSaveStatus('saved'), 250); }}
        onDraftBlur={() => setSaveStatus('saved')}
        onLock={() => { setMyLocked(true); setOppLocked(true); onNavigate('deliberating'); }}
        onLeave={() => onNavigate('home')} myLocked={myLocked} oppLocked={oppLocked}
        busy={false} error={isOffline ? 'The demo is pretending the connection dropped. You can keep typing or continue to the canned result.' : null} />
    </>;
  }

  if (route === 'locked') return <>
    <DemoStrip note="Your sample argument is locked. Maya is simulated and can finish when you choose.">
      <button className="primary" onClick={() => { setOppLocked(true); onNavigate('deliberating'); }}>Have Maya lock in</button>
    </DemoStrip>
    <Round claim={selectedTopic.positionA} index={roundIndex} phase="writing" timeUp={false}
      countdownLeft={0} writeLeft={Math.max(writeLeft, 38)} draft={draft || `“${selectedTopic.positionA}” gives people a clear rule and a practical benefit.`}
      saveStatus="saved" onDraftChange={setDraft} onDraftBlur={() => undefined} onLock={() => undefined}
      onLeave={() => onNavigate('home')} myLocked oppLocked={false} busy={false} error={null} />
  </>;

  if (route === 'deliberating') return <><DemoStrip note="No judge is being called. Reveal the prewritten sample when you are ready.">
    <button className="primary" onClick={() => onNavigate('verdict')}>Reveal sample verdict</button>
  </DemoStrip><Deliberating showRetry={false} longWait={false} onRetry={() => onNavigate('verdict')} /></>;

  if (route === 'verdict') return verdict('judged');
  if (route === 'verdict-loss') return verdict('judged', 2);
  if (route === 'match') return verdict('judged', 3, true);
  if (route === 'tie') return verdict('tie');
  if (route === 'dq') return verdict('dq');
  if (route === 'forfeit') return verdict('forfeit');

  if (route === 'unavailable') return <><DemoStrip note="The fictional judge is unavailable. Your sample arguments remain safe in memory." />
    <Deliberating showRetry longWait onRetry={() => onNavigate('verdict')} /></>;

  if (route === 'error') return <StateCard eyebrow="Submission error" title="Your argument was not submitted"
    primary={{ label: 'Return to writing', action: () => onNavigate('writing') }}
    secondary={{ label: 'Leave this sample game', action: () => onNavigate('home') }}>
      The simulated submission failed. Your draft is still in this browser tab, so you can retry without retyping it.
    </StateCard>;

  return <StateCard eyebrow="Game demo" title="Screen not found"
    primary={{ label: 'Return to game home', action: () => onNavigate('home') }}>
      The route “{route}” is not part of this walkthrough.
    </StateCard>;
}

declare global {
  interface Window {
    render_game_to_text?: () => string;
  }
}
