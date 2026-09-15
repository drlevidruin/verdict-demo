import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Deliberating } from '../screens/Deliberating';
import { Home } from '../screens/Home';
import { Invite } from '../screens/Invite';
import { Lobby } from '../screens/Lobby';
import { Round } from '../screens/Round';
import { TopicLibrary } from '../screens/TopicLibrary';
import { VerdictScreen } from '../screens/Verdict';
import { TOPICS } from '../shared/topics';
import { CONFIG } from '../shared/config';
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
  inspecting?: boolean;
};

type Scores = { me: number; friend: number };
type TopicIntent =
  | { kind: 'next-round'; nextIndex: number; scores: Scores; returnScreen: string }
  | { kind: 'new-match'; returnScreen: string };

const ME = 'demo-me';
const FRIEND = 'demo-friend';
const stamp = { seconds: 0, toMillis: () => 0 };
const fallbackTopic = TOPICS.find((topic) => topic.id === 't03') ?? TOPICS[0];
const roundTopicIds = ['t03', 't07', 't19'];

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

function nextCatalogTopic(current: TopicSnapshot, completedRound: number): TopicSnapshot {
  const currentIndex = roundTopicIds.indexOf(current.id);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % roundTopicIds.length : (completedRound - 1) % roundTopicIds.length;
  return catalogSnapshot(roundTopicIds[nextIndex]);
}

function completedScores(variant: VerdictKind | 'tie', index: number): Scores {
  if (variant === 'dq' || variant === 'forfeit') return { me: 0, friend: 1 };
  if (variant === 'tie' || variant === 'mistrial') return { me: 0, friend: 0 };
  if (index === 1) return { me: 1, friend: 0 };
  if (index === 2) return { me: 1, friend: 1 };
  return { me: 2, friend: 1 };
}

function cannedVerdict(
  topic: TopicSnapshot,
  index: number,
  variant: VerdictKind | 'tie' = 'judged',
): Verdict {
  const meIsA = index % 2 === 1;
  const friendWins = index === 2;
  const myLabel = meIsA ? 'A' : 'B';
  const friendLabel = meIsA ? 'B' : 'A';
  let winner: 'A' | 'B' | 'TIE' = variant === 'tie' ? 'TIE' : friendWins ? friendLabel : myLabel;
  const isSpecial = variant !== 'judged' && variant !== 'tie';
  const proText = topic.id === 't03'
    ? 'Pineapple belongs on pizza because its bright sweetness balances salty cheese and tomato. Sweet and savory combinations already work in barbecue and chutney, so pizza can handle the same contrast.'
    : `“${topic.positionA}” is the stronger position because it creates a clear, practical rule people can understand. The opposing view has exceptions, but those exceptions do not outweigh the everyday benefit.`;
  const conText = topic.id === 't03'
    ? 'Pineapple does not belong on pizza because its juice softens the crust and overpowers the sauce. Pizza toppings should add savoriness and texture, not turn each bite into a sweet snack.'
    : `“${topic.positionB}” better fits real life because a flexible response handles more situations. A simple rule sounds appealing, but it breaks down when circumstances and people differ.`;

  const high = { clarity: 9, persuasion: 9, relevance: 8, style: 8 };
  const low = { clarity: 8, persuasion: 7, relevance: 8, style: 7 };
  const even = { clarity: 8, persuasion: 8, relevance: 8, style: 8 };
  const scores = isSpecial ? null : variant === 'tie' ? {
    a: even,
    b: even,
  } : winner === 'A' ? { a: high, b: low } : { a: low, b: high };
  const totals = scores ? {
    a: Object.values(scores.a).reduce((sum, value) => sum + value, 0),
    b: Object.values(scores.b).reduce((sum, value) => sum + value, 0),
  } : null;

  const kind: VerdictKind = variant === 'tie' ? 'judged' : variant;
  let winnerUid: string | null = winner === 'TIE' ? null : winner === myLabel ? ME : FRIEND;
  let ruling = winnerUid === ME
    ? `The prewritten sample for your side made a direct claim, supported it with a concrete comparison, and answered the other side's main concern.`
    : winnerUid === FRIEND
      ? `The prewritten sample for Maya's side connected the claim to a practical consequence and handled the strongest objection more directly.`
      : 'Both sample arguments were equally clear, relevant, and persuasive, so neither side earns a match point.';
  let dq: Verdict['dq'] = null;

  if (variant === 'dq') {
    winnerUid = FRIEND;
    winner = friendLabel;
    ruling = 'The sample submission tried to instruct the judge how to score it, so it was disqualified.';
    dq = { a: myLabel === 'A', b: myLabel === 'B', reason: 'Attempted judge manipulation' };
  } else if (variant === 'forfeit') {
    winnerUid = FRIEND;
    winner = friendLabel;
    ruling = `The sample for your side was empty when time expired, so Maya receives one match point by forfeit.`;
  }

  return {
    kind,
    winner,
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
      a: { uid: meIsA ? ME : FRIEND, name: 'Sample debater A', side: 'PRO', text: variant === 'forfeit' && myLabel === 'A' ? '' : proText },
      b: { uid: meIsA ? FRIEND : ME, name: 'Sample debater B', side: 'CON', text: variant === 'forfeit' && myLabel === 'B' ? '' : conText },
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

export function GameDemo({ screen, onNavigate, inspecting = false }: Props) {
  const route = screen || 'home';
  const [name, setName] = useState('Alex');
  const [selectedTopic, setSelectedTopic] = useState<TopicSnapshot>(() => catalogSnapshot(fallbackTopic.id));
  const [friendJoined, setFriendJoined] = useState(false);
  const [iAmReady, setIAmReady] = useState(false);
  const [friendReady, setFriendReady] = useState(false);
  const [roundIndex, setRoundIndex] = useState(1);
  const [scores, setScores] = useState<Scores>({ me: 0, friend: 0 });
  const [countdownLeft, setCountdownLeft] = useState<number>(CONFIG.COUNTDOWN_SECONDS);
  const [writeLeft, setWriteLeft] = useState<number>(CONFIG.WRITING_SECONDS);
  const [countdownRunning, setCountdownRunning] = useState(false);
  const [writingRunning, setWritingRunning] = useState(false);
  const [draft, setDraft] = useState('');
  const [myLocked, setMyLocked] = useState(false);
  const [oppLocked, setOppLocked] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const [homeError, setHomeError] = useState<string | null>(null);
  const [resultResponse, setResultResponse] = useState<ResultFeedbackResponse | null>(null);
  const [topicIntent, setTopicIntent] = useState<TopicIntent | null>(null);

  const resultTopic = selectedTopic.kind === 'custom' ? catalogSnapshot(fallbackTopic.id) : selectedTopic;
  const playerClaim = roundIndex % 2 === 1 ? selectedTopic.positionA : selectedTopic.positionB;
  const goCountdown = (runImmediately = true) => {
    setCountdownLeft(CONFIG.COUNTDOWN_SECONDS);
    setWriteLeft(CONFIG.WRITING_SECONDS);
    setDraft('');
    setMyLocked(false);
    setOppLocked(false);
    setSaveStatus('saved');
    setIAmReady(false);
    setFriendReady(false);
    setCountdownRunning(runImmediately);
    setWritingRunning(false);
    onNavigate('countdown');
  };

  const resetMatch = (joined: boolean) => {
    setFriendJoined(joined);
    setIAmReady(false);
    setFriendReady(false);
    setRoundIndex(1);
    setScores({ me: 0, friend: 0 });
    setCountdownLeft(CONFIG.COUNTDOWN_SECONDS);
    setWriteLeft(CONFIG.WRITING_SECONDS);
    setCountdownRunning(false);
    setWritingRunning(false);
    setDraft('');
    setMyLocked(false);
    setOppLocked(false);
    setSaveStatus('saved');
    setResultResponse(null);
    setTopicIntent(null);
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
    if (route !== 'countdown' || !countdownRunning) return;
    const timer = window.setInterval(() => {
      setCountdownLeft((left) => Math.max(0, left - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [route, countdownRunning]);

  useEffect(() => {
    if (route !== 'countdown' || countdownLeft > 0) return;
    setWritingRunning(!inspecting);
    onNavigate('writing');
  }, [route, countdownLeft, inspecting, onNavigate]);

  useEffect(() => {
    if (route !== 'writing' || !writingRunning) return;
    const timer = window.setInterval(() => {
      setWriteLeft((left) => Math.max(0, left - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [route, writingRunning]);

  useEffect(() => {
    if (route !== 'writing' || writeLeft > 0) return;
    setOppLocked(true);
    onNavigate('timeup');
  }, [route, writeLeft, onNavigate]);

  useEffect(() => {
    const advance = (event: Event) => {
      const ms = Number((event as CustomEvent<number>).detail) || 0;
      const seconds = Math.max(0, ms / 1000);
      if (route === 'countdown' && countdownRunning) {
        setCountdownLeft((left) => Math.max(0, left - seconds));
      } else if (route === 'writing' && writingRunning) {
        setWriteLeft((left) => Math.max(0, left - seconds));
      }
    };
    window.addEventListener('verdict:advance-time', advance);
    return () => window.removeEventListener('verdict:advance-time', advance);
  }, [route, countdownRunning, writingRunning]);

  useEffect(() => {
    const shownRound = route === 'verdict-loss' ? 2 : route === 'match' ? 3 : roundIndex;
    const shownVariant: VerdictKind | 'tie' = route === 'tie' ? 'tie' : route === 'dq' ? 'dq' : route === 'forfeit' ? 'forfeit' : 'judged';
    const resultRoute = ['verdict', 'verdict-loss', 'match', 'tie', 'dq', 'forfeit'].includes(route);
    const shownFriendJoined = route === 'lobby-full' || (route === 'lobby' ? friendJoined : !['home', 'invite', 'invite-error', 'topics'].includes(route));
    const shownFriendReady = route === 'lobby-full' ? true : friendReady;
    const render = () => JSON.stringify({
      demo: 'game',
      screen: route,
      topic: resultRoute ? resultTopic.title : selectedTopic.title,
      player: name,
      friendJoined: shownFriendJoined,
      ready: { player: iAmReady, friend: shownFriendReady },
      round: shownRound,
      countdownLeft,
      writeLeft,
      timerRunning: route === 'countdown' ? countdownRunning : writingRunning,
      inspecting,
      draftLength: draft.length,
      locked: { player: myLocked, friend: oppLocked },
      score: resultRoute ? completedScores(shownVariant, shownRound) : scores,
    });
    window.render_game_to_text = render;
    return () => {
      if (window.render_game_to_text === render) delete window.render_game_to_text;
    };
  }, [route, selectedTopic, resultTopic, name, friendJoined, iAmReady, friendReady, roundIndex, countdownLeft, writeLeft, countdownRunning, writingRunning, inspecting, draft, myLocked, oppLocked, scores]);

  const room = (variant: VerdictKind | 'tie' = 'judged', viewIndex = roundIndex, forceMatch = false): RoomDoc => {
    const shownScores = route === 'verdict' || route === 'verdict-loss' || route === 'match' || route === 'tie' || route === 'dq' || route === 'forfeit'
      ? variant === 'judged'
        ? viewIndex === 1 ? { me: 1, friend: 0 } : viewIndex === 2 ? { me: 1, friend: 1 } : { me: 2, friend: 1 }
        : variant === 'dq' || variant === 'forfeit' ? { me: 0, friend: 1 } : { me: 0, friend: 0 }
      : scores;
    const upcomingTopic = nextCatalogTopic(resultTopic, viewIndex);
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
      currentRoundId: `sample-round-${viewIndex}-${resultTopic.id}`,
      roundCount: viewIndex,
      usedTopicIds: [selectedTopic.id],
      lastProUid: ME,
      selectedTopic: route === 'verdict' || route === 'verdict-loss' || route === 'match' || route === 'tie' || route === 'dq' || route === 'forfeit'
        ? upcomingTopic
        : selectedTopic,
      topicConfirmed: { [ME]: true, [FRIEND]: true },
      matchWinner: forceMatch || (route === 'verdict' && viewIndex >= 3) ? { uid: ME, name, wins: 2 } : null,
      createdAt: stamp,
      expiresAt: stamp,
    };
  };

  const round = (variant: VerdictKind | 'tie' = 'judged', viewIndex = roundIndex): RoundDoc & { id: string } => ({
    id: `sample-round-${viewIndex}-${resultTopic.id}`,
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
    sides: viewIndex % 2 === 1 ? { [ME]: 'PRO', [FRIEND]: 'CON' } : { [ME]: 'CON', [FRIEND]: 'PRO' },
    debaterA: viewIndex % 2 === 1 ? ME : FRIEND,
    debaterB: viewIndex % 2 === 1 ? FRIEND : ME,
    locked: { [ME]: true, [FRIEND]: true },
    status: 'verdict',
    createdAt: stamp,
    startsAt: stamp,
    deadlineAt: stamp,
    judging: null,
    verdict: cannedVerdict(resultTopic, viewIndex, variant),
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
            resetMatch(true);
            setSelectedTopic(nextCatalogTopic(resultTopic, viewIndex));
            goCountdown();
            return;
          }
          if (forceMatch || viewIndex >= 3) {
            setTopicIntent({ kind: 'new-match', returnScreen: route });
            onNavigate('topics');
            return;
          }
          const nextIndex = viewIndex + 1;
          setScores(viewIndex === 1 ? { me: 1, friend: 0 } : { me: 1, friend: 1 });
          setRoundIndex(nextIndex);
          setSelectedTopic(nextCatalogTopic(resultTopic, viewIndex));
          setResultResponse(null);
          goCountdown();
        }}
        primaryLabelOverride={variant !== 'judged' ? 'Start a fresh sample game' : undefined}
        onChangeTopic={() => {
          setTopicIntent(forceMatch || viewIndex >= 3
            ? { kind: 'new-match', returnScreen: route }
            : { kind: 'next-round', nextIndex: viewIndex + 1, scores: completedScores(variant, viewIndex), returnScreen: route });
          onNavigate('topics');
        }}
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

  if (route === 'invite' || route === 'invite-error') return <><DemoStrip note="This is a fictional invitation. It opens an isolated walkthrough and never connects two browsers." />
    <Invite secure={false} code="DEMO" busy={false} expired={route === 'invite-error'}
      error={route === 'invite-error' ? 'This sample invitation has expired and cannot be joined.' : null}
      onJoin={(playerName) => { setName(playerName || 'Alex'); resetMatch(true); onNavigate('lobby'); }}
      onOpenWorkingInvite={() => onNavigate('invite')} onDismiss={() => onNavigate('home')} /></>;

  if (route === 'topics') return <TopicLibrary busy={false} error={null}
    onBack={() => onNavigate(topicIntent?.returnScreen ?? 'lobby')}
    onConfirm={(selection) => {
      const nextTopic = snapshotFromSelection(selection);
      if (topicIntent?.kind === 'new-match') {
        resetMatch(true);
      } else if (topicIntent?.kind === 'next-round') {
        setScores(topicIntent.scores);
        setRoundIndex(topicIntent.nextIndex);
        setFriendJoined(true);
        setIAmReady(false);
        setFriendReady(false);
        setCountdownLeft(CONFIG.COUNTDOWN_SECONDS);
        setWriteLeft(CONFIG.WRITING_SECONDS);
        setCountdownRunning(false);
        setWritingRunning(false);
        setDraft('');
        setMyLocked(false);
        setOppLocked(false);
        setSaveStatus('saved');
        setResultResponse(null);
      }
      setSelectedTopic(nextTopic);
      setTopicIntent(null);
      onNavigate('lobby');
    }} />;

  if (route === 'lobby' || route === 'lobby-full') {
    const fullPreview = route === 'lobby-full';
    const previewFriendReady = fullPreview || friendReady;
    return <>
    <DemoStrip note="Maya is a simulated friend. No invite is sent and no multiplayer connection is opened.">
      {!friendJoined && !fullPreview ? null
        : !previewFriendReady ? <button className="quiet" onClick={() => { setFriendReady(true); if (iAmReady) goCountdown(); }}>Have Maya tap Ready</button>
          : <span className="game-demo-ready">Maya is ready</span>}
    </DemoStrip>
    <Lobby code="DEMO" inviteToken="fictional-demo" room={fullPreview ? { ...room(), players: { [ME]: { name, joinedAt: stamp }, [FRIEND]: { name: 'Maya', joinedAt: stamp } }, playerOrder: [ME, FRIEND], rematch: { [ME]: false, [FRIEND]: true } } : room()} uid={ME}
      readyCount={Number(iAmReady) + Number(previewFriendReady)} iAmReady={iAmReady} busy={false} error={null}
      onReady={() => { setIAmReady(true); if (previewFriendReady) goCountdown(); }}
      onDemoAdvance={!friendJoined && !fullPreview ? () => { setFriendJoined(true); setFriendReady(false); } : undefined}
      onChangeTopic={() => { setTopicIntent(null); onNavigate('topics'); }} onLeave={() => onNavigate('home')} />
  </>;
  }

  if (route === 'countdown') return <><DemoStrip note={countdownRunning ? 'The local countdown is running.' : 'Paused for inspection. Start it when you are ready.'} />
    <Round claim={playerClaim} index={roundIndex} phase="countdown" timeUp={false}
      countdownLeft={Math.ceil(countdownLeft)} writeLeft={CONFIG.WRITING_SECONDS} draft={draft} saveStatus="saved"
      timerRunning={countdownRunning} onTimerToggle={() => setCountdownRunning((running) => !running)}
      onDraftChange={setDraft} onDraftBlur={() => undefined} onLock={() => undefined} onLeave={() => onNavigate('home')}
      myLocked={false} oppLocked={false} busy={false} error={null} /></>;

  if (route === 'writing' || route === 'offline' || route === 'timeup') {
    const isOffline = route === 'offline';
    const isTimeUp = route === 'timeup';
    return <>
      <DemoStrip note={isOffline
        ? 'Offline is simulated. Your draft remains only in component memory.'
        : 'The timer is local. The sample verdict is fixed and never grades the text below.'}>
        {!isTimeUp && <button className="quiet" onClick={() => setDraft(`“${playerClaim}” is convincing because it gives people a clear rule and a practical benefit. A concrete example would make the case even stronger.`)}>Use sample argument</button>}
      </DemoStrip>
      <Round claim={playerClaim} index={roundIndex} phase="writing" timeUp={isTimeUp}
        countdownLeft={0} writeLeft={isTimeUp ? 0 : Math.ceil(writeLeft)} draft={draft}
        saveStatus={isOffline ? 'offline' : saveStatus}
        timerRunning={writingRunning} onTimerToggle={() => setWritingRunning((running) => !running)}
        onDraftChange={(value) => { setDraft(value); setSaveStatus('saving'); window.setTimeout(() => setSaveStatus('saved'), 250); }}
        onDraftBlur={() => setSaveStatus('saved')}
        onLock={() => { setMyLocked(true); setOppLocked(true); onNavigate('deliberating'); }}
        onLeave={() => onNavigate('home')} myLocked={myLocked} oppLocked={oppLocked}
        advanceLabel={isTimeUp ? 'See prewritten sample result' : undefined}
        onAdvance={isTimeUp ? () => onNavigate('deliberating') : undefined}
        recoveryLabel={isOffline ? 'Reconnect demo state' : undefined}
        onRecover={isOffline ? () => { setSaveStatus('saved'); onNavigate('writing'); } : undefined}
        busy={false} error={isOffline ? 'Connection interrupted in this simulation. Your draft is retained in this tab.' : null} />
    </>;
  }

  if (route === 'locked') return <>
    <DemoStrip note="This fixture shows the confirmed submission state. Maya remains simulated." />
    <Round claim={playerClaim} index={roundIndex} phase="writing" timeUp={false}
      countdownLeft={0} writeLeft={Math.max(writeLeft, 38)} draft={draft || `“${playerClaim}” gives people a clear rule and a practical benefit.`}
      saveStatus="saved" onDraftChange={setDraft} onDraftBlur={() => undefined} onLock={() => undefined}
      onLeave={() => onNavigate('home')} myLocked oppLocked={false} busy={false} error={null}
      advanceLabel="Have Maya finish and continue" onAdvance={() => { setOppLocked(true); onNavigate('deliberating'); }} />
  </>;

  if (route === 'deliberating') return <><DemoStrip note="No judge is being called. The result is prewritten and ready to inspect." />
    <Deliberating showRetry={false} longWait={false} onRetry={() => onNavigate('verdict')}
      onAdvance={() => onNavigate('verdict')} actionLabel="Show prewritten sample result" /></>;

  if (route === 'verdict') return verdict('judged');
  if (route === 'verdict-loss') return verdict('judged', 2);
  if (route === 'match') return verdict('judged', 3, true);
  if (route === 'tie') return verdict('tie');
  if (route === 'dq') return verdict('dq');
  if (route === 'forfeit') return verdict('forfeit');

  if (route === 'unavailable') return <><DemoStrip note="This is a recoverable fictional failure. No request is being retried." />
    <Deliberating showRetry longWait title="Sample judge unavailable"
      message="The fictional judge could not return a result. Both prewritten arguments remain safe."
      actionLabel="Open the working sample result" onRetry={() => onNavigate('verdict')} /></>;

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
