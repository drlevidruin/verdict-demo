// Presentation data and types adapted for the public fictional demo.

// Shared data model types. Timestamps are Firestore Timestamps on the wire;
// they are typed loosely here so the same file compiles in the client
// (firebase) and in functions (firebase-admin).

export type TimestampLike = { toMillis(): number; seconds: number };

export type Side = 'PRO' | 'CON';
export type DebaterLabel = 'A' | 'B';

export interface CatalogTopicSelection {
  kind: 'catalog';
  topicId: string;
}

export interface SurpriseTopicSelection {
  kind: 'surprise';
}

export interface CustomTopicSelection {
  kind: 'custom';
  question: string;
  positionA: string;
  positionB: string;
  context?: string;
}

export type TopicSelectionInput = CatalogTopicSelection | SurpriseTopicSelection | CustomTopicSelection;

export interface TopicSnapshot {
  kind: 'catalog' | 'custom';
  id: string;
  version: number;
  title: string;
  question: string;
  positionA: string;
  positionB: string;
  category: string;
  context: string | null;
  visibility: 'public' | 'room-private';
}

export type RoomStatus = 'lobby' | 'playing';
// countdown and writing are both stored as 'open'; the client derives the
// visible phase from startsAt / deadlineAt (server-written, authoritative).
export type RoundStatus = 'open' | 'judging' | 'verdict';

export interface PlayerInfo {
  name: string;
  joinedAt: TimestampLike;
}

export interface RoomDoc {
  code: string;
  status: RoomStatus;
  hostUid: string;
  players: Record<string, PlayerInfo>;
  playerOrder: string[];
  scores: Record<string, number>;
  rematch: Record<string, boolean>;
  currentRoundId: string | null;
  roundCount: number;
  usedTopicIds: string[];
  lastProUid: string | null;
  selectedTopic?: TopicSnapshot;
  topicConfirmed?: Record<string, boolean>;
  // Set when a player reaches MATCH_TARGET_WINS; cleared (with a 0-0 score
  // reset) when the next round starts.
  matchWinner?: { uid: string; name: string; wins: number } | null;
  createdAt: TimestampLike;
  expiresAt: TimestampLike;
}

export interface JudgingLease {
  attemptId: string;
  claimedBy: string;
  claimedAt: TimestampLike;
  failedAt: TimestampLike | null;
  attempts: number;
}

export interface RoundDoc {
  index: number;
  // 1-based index of this round WITHIN the current first-to-N match. Resets to 1
  // when a new match starts (first round, a finished match, or a leave reset).
  // `index` keeps climbing across matches for the per-room round cap; this is
  // the number the results screen shows ("Ready for Round N"). Optional for
  // rounds created before this field existed.
  matchRoundIndex?: number;
  topicId: string;
  topicVersion?: number;
  topicKind?: 'catalog' | 'custom';
  topicQuestion?: string;
  topicCategory?: string;
  topicContext?: string | null;
  topicText: string;
  // The exact claim each side must argue, negation spelled out. Written by
  // the server from the topic deck. Optional for rounds created before this
  // field existed.
  claimPro?: string;
  claimCon?: string;
  // uid -> side and label maps, written by the server at round creation.
  sides: Record<string, Side>;
  debaterA: string; // uid arguing PRO
  debaterB: string; // uid arguing CON
  locked: Record<string, boolean>;
  status: RoundStatus;
  createdAt: TimestampLike;
  startsAt: TimestampLike; // countdown ends, writing begins
  deadlineAt: TimestampLike; // writing ends
  judging: JudgingLease | null;
  verdict: Verdict | null;
  expiresAt: TimestampLike;
}

export interface SubmissionDoc {
  uid: string;
  draft: string;
  content: string; // finalized text, server-written at lock or judge claim
  locked: boolean;
  draftUpdatedAt: TimestampLike | null;
  lockedAt: TimestampLike | null;
  expiresAt: TimestampLike;
}

export interface CategoryScores {
  clarity: number;
  persuasion: number;
  relevance: number;
  style: number;
}

export type VerdictKind =
  | 'judged' // scored by the model
  | 'forfeit' // one empty argument, auto loss
  | 'double_forfeit' // both empty, contempt of court
  | 'dq' // one side disqualified for manipulation
  | 'double_dq' // both sides disqualified
  | 'mistrial'; // judging failed repeatedly; tie, no points, round closed

export interface VerdictArgument {
  uid: string;
  name: string;
  side: Side;
  text: string;
}

export interface Verdict {
  kind: VerdictKind;
  winner: DebaterLabel | 'TIE';
  winnerUid: string | null;
  scores: { a: CategoryScores; b: CategoryScores } | null;
  totals: { a: number; b: number } | null;
  remarkA: string;
  remarkB: string;
  nextStepA?: string;
  nextStepB?: string;
  ruling: string;
  dq: { a: boolean; b: boolean; reason: string } | null;
  winnerAdjusted: boolean;
  // True only when equal model totals were settled by the deterministic
  // tiebreak and the displayed scorecard received a one-point adjustment.
  scoreTieAdjusted?: boolean;
  args: { a: VerdictArgument; b: VerdictArgument };
  model: string;
  promptVersion: string;
  judgedAt: TimestampLike;
}

export type ResultFeedbackRating = 'helpful' | 'unfair' | 'problem';

export interface ResultFeedbackResponse {
  rating: ResultFeedbackRating;
  helpful: boolean;
  issue: string | null;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
  expiresAt: TimestampLike;
}

// Callable payloads and results.

export type RoomActionRequest =
  | { action: 'create'; name: string; topic?: TopicSelectionInput }
  | {
      action: 'join';
      name: string;
      code?: string;
      inviteToken?: string;
      previousCode?: string;
    }
  | { action: 'selectTopic'; code: string; topic: TopicSelectionInput }
  | { action: 'ready'; code: string }
  | { action: 'lock'; code: string; roundId: string; text: string }
  | {
      action: 'submitResultFeedback';
      code: string;
      roundId: string;
      rating: ResultFeedbackRating;
      issue?: string;
    }
  // Vacates the seat server-side so the opponent is not left with a ghost
  // player and a replacement invitee is not told the room is full.
  | { action: 'leave'; code: string };

export interface RoomActionResult {
  ok: true;
  code: string;
  inviteToken?: string;
  roundId?: string;
  bothLocked?: boolean;
}

export interface JudgeRoundRequest {
  roomCode: string;
  roundId: string;
  // A warm ping fired during the countdown. Boots the function instance and
  // preloads the Anthropic client so the real verdict call ~60s later never
  // pays a cold start. Performs no reads and no judging.
  warm?: boolean;
}

export type JudgeRoundResult =
  | { status: 'verdict' }
  | { status: 'warm' }
  // The model result arrived after the room moved on. Nothing was written.
  | { status: 'closed' }
  // Another attempt holds a live judging lease. retryAfterMs says how long
  // until that lease can be reclaimed, so clients can schedule a retry
  // instead of guessing.
  | { status: 'busy'; retryAfterMs: number };
