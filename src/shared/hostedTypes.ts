// Presentation data and types adapted for the public fictional demo.

import type { TimestampLike } from './types';

// Host a Group is deliberately parallel to Quick Play. Participants are
// referenced in public session records by a random, group-scoped id rather
// than by their Firebase anonymous-auth uid.
export type HostedParticipantId = string;

export type HostedGroupKind =
  | 'classroom'
  | 'professionalDevelopment'
  | 'icebreaker'
  | 'other';
export type HostedGroupStatus = 'open' | 'inSession' | 'archived';
export type HostedTopicType = 'proposition' | 'twoPosition';
export type HostedTopicVisibility = 'private' | 'shared';
export type HostedSessionFormat = 'single' | 'tournament';
export type HostedSessionStatus = 'active' | 'betweenStages' | 'complete' | 'cancelled';
export type HostedPairStatus = 'writing' | 'judging' | 'verdict' | 'closed';
export type HostedParticipantStatus =
  | 'waiting'
  | 'writing'
  | 'submitted'
  | 'judging'
  | 'advanced'
  | 'eliminated'
  | 'complete'
  | 'withdrawn'
  | 'bye';
export type HostedPositionKey = 'A' | 'B';
export type HostedSubmissionFinalState = 'open' | 'submitted' | 'deadline_missing';

export interface HostedPosition {
  text: string;
  attribution: string | null;
}

export interface HostedSource {
  id: string;
  label: string | null;
  text: string;
}

export interface HostedPracticeGuidance {
  exerciseId: string;
  title: string;
  learningPurpose: string;
  facilitatorNotes: string;
  debriefQuestions: string[];
}

export interface HostedTopicInput {
  type: HostedTopicType;
  question: string;
  positionA: HostedPosition;
  positionB: HostedPosition;
  sources: HostedSource[];
  practice?: HostedPracticeGuidance;
}

// A session keeps this complete snapshot, so editing or deleting a saved topic
// can never rewrite a past class or workshop record.
export type HostedTopicSnapshot = HostedTopicInput;

export interface HostedTopicDoc extends HostedTopicInput {
  ownerUid: string;
  visibility: HostedTopicVisibility;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface HostedGroupDoc {
  ownerUid: string;
  name: string;
  kind: HostedGroupKind;
  code: string;
  status: HostedGroupStatus;
  activeSessionId: string | null;
  memberCount: number;
  pairRoundCap: number;
  createdAt: TimestampLike;
  updatedAt: TimestampLike;
}

// The membership document may be keyed by Firebase uid for rule lookups, but
// that uid is never copied into participant, pair, verdict, or export data.
export interface HostedMemberDoc {
  participantId: HostedParticipantId;
  displayName: string;
  joinedAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface HostedGroupParticipantDoc {
  participantId: HostedParticipantId;
  displayName: string;
  active: boolean;
  activeSessionId: string | null;
  currentPairId: string | null;
  status: HostedParticipantStatus;
  joinedAt: TimestampLike;
  updatedAt: TimestampLike;
}

export type HostedTimer =
  | { kind: 'timed'; writingSeconds: number }
  | { kind: 'untimed' };

export interface HostedSessionDoc {
  groupId: string;
  format: HostedSessionFormat;
  status: HostedSessionStatus;
  timer: HostedTimer;
  argumentCharLimit: number;
  topic: HostedTopicSnapshot;
  currentStageIndex: number;
  currentStagePairIds: string[];
  participantCount: number;
  pairRoundCap: number;
  pairRoundsReserved: number;
  pairRoundsCompleted: number;
  championParticipantId: HostedParticipantId | null;
  championName: string | null;
  providerDisclosureVersion: string;
  createdAt: TimestampLike;
  startedAt: TimestampLike;
  completedAt: TimestampLike | null;
  // New sessions always carry this fixed cutoff. Readers and cleanup use a
  // createdAt/completedAt fallback for records created before this field.
  expiresAt?: TimestampLike;
  deletionRequestedAt?: TimestampLike;
}

export interface HostedSessionSummary {
  id: string;
  status: HostedSessionStatus;
  topicQuestion: string;
  participantCount: number;
  startedAtMs: number;
  expiresAtMs: number;
}

export interface HostedParticipantDoc {
  participantId: HostedParticipantId;
  displayName: string;
  status: HostedParticipantStatus;
  currentPairId: string | null;
  stageIndex: number;
  hadBye: boolean;
  joinedSessionAt: TimestampLike;
  updatedAt: TimestampLike;
}

export interface HostedCategoryScores {
  claimClarity: number;
  // There is nothing to score here when the host supplied no mekoros.
  sourceUse: number | null;
  rebuttal: number;
  internalConsistency: number;
}

export type HostedVerdictKind =
  | 'judged'
  | 'forfeit'
  | 'double_forfeit'
  | 'dq'
  | 'double_dq'
  | 'mistrial'
  | 'bye';

export type HostedAdvancementReason =
  | 'judged'
  | 'forfeit'
  | 'score_tiebreak'
  | 'coin_flip'
  | 'bye'
  | 'none';

export interface HostedPairResult {
  kind: HostedVerdictKind;
  winner: HostedPositionKey | 'TIE';
  winnerParticipantId: HostedParticipantId | null;
  comparison: string;
  totals: { a: number; b: number } | null;
  advancementReason: HostedAdvancementReason;
  dq: { a: boolean; b: boolean; reason: string } | null;
  winnerAdjusted: boolean;
  model: string;
  promptVersion: string;
  safetyFallbackUsed: boolean;
  judgedAt: TimestampLike;
}

export interface HostedJudgingLease {
  attemptId: string;
  claimedBy: string;
  claimedAt: TimestampLike;
  failedAt: TimestampLike | null;
  attempts: number;
}

export interface HostedDebatePairDoc {
  kind: 'debate';
  groupId: string;
  sessionId: string;
  stageIndex: number;
  participantIds: [HostedParticipantId, HostedParticipantId];
  participantNames: Record<HostedParticipantId, string>;
  debaterAParticipantId: HostedParticipantId;
  debaterBParticipantId: HostedParticipantId;
  locked: Record<HostedParticipantId, boolean>;
  status: HostedPairStatus;
  startsAt: TimestampLike;
  deadlineAt: TimestampLike | null;
  // Always present, including in untimed mode, so the rules never need to add
  // a duration to null. Untimed sessions use the configured safety fence.
  writeFenceAt: TimestampLike;
  judging: HostedJudgingLease | null;
  result: HostedPairResult | null;
  createdAt: TimestampLike;
}

export interface HostedByePairDoc {
  kind: 'bye';
  groupId: string;
  sessionId: string;
  stageIndex: number;
  participantIds: [HostedParticipantId];
  participantNames: Record<HostedParticipantId, string>;
  debaterAParticipantId: HostedParticipantId;
  debaterBParticipantId: null;
  locked: Record<HostedParticipantId, boolean>;
  status: 'verdict';
  startsAt: null;
  deadlineAt: null;
  writeFenceAt: null;
  judging: null;
  result: HostedPairResult;
  createdAt: TimestampLike;
}

export type HostedPairDoc = HostedDebatePairDoc | HostedByePairDoc;

export interface HostedSubmissionDoc {
  participantId: HostedParticipantId;
  draft: string;
  content: string;
  locked: boolean;
  finalState: HostedSubmissionFinalState;
  draftUpdatedAt: TimestampLike | null;
  lockedAt: TimestampLike | null;
}

export interface HostedFeedbackDoc {
  participantId: HostedParticipantId;
  pairId: string;
  stageIndex: number;
  scores: HostedCategoryScores | null;
  paragraph: string;
  createdAt: TimestampLike;
}

export type HostedHostActionRequest =
  | { action: 'createGroup'; name: string; kind: HostedGroupKind; pairRoundCap?: number }
  | { action: 'regenerateCode'; groupId: string }
  | { action: 'archiveGroup'; groupId: string }
  | { action: 'removeParticipant'; groupId: string; participantId: string }
  | {
      action: 'saveTopic';
      topicId?: string;
      topic: HostedTopicInput;
      visibility: HostedTopicVisibility;
    }
  | { action: 'deleteTopic'; topicId: string }
  | {
      action: 'startSession';
      groupId: string;
      format: HostedSessionFormat;
      timer: HostedTimer;
      argumentCharLimit?: number;
      topic:
        | { source: 'inline'; value: HostedTopicInput }
        | { source: 'saved'; topicId: string };
    }
  | { action: 'closeExpiredPair'; groupId: string; sessionId: string; pairId: string }
  | { action: 'advanceTournament'; groupId: string; sessionId: string }
  | { action: 'cancelSession'; groupId: string; sessionId: string }
  | { action: 'listSessions'; groupId: string }
  | { action: 'deleteSession'; groupId: string; sessionId: string };

export type HostedHostActionResult =
  | { ok: true; action: 'createGroup'; groupId: string; code: string }
  | { ok: true; action: 'regenerateCode'; groupId: string; code: string }
  | { ok: true; action: 'saveTopic'; topicId: string }
  | { ok: true; action: 'startSession'; groupId: string; sessionId: string; stageIndex: 1 }
  | {
      ok: true;
      action: 'advanceTournament';
      status: 'active';
      stageIndex: number;
    }
  | {
      ok: true;
      action: 'advanceTournament';
      status: 'complete';
      championParticipantId: string;
      championName: string;
    }
  | {
      ok: true;
      action:
        | 'archiveGroup'
        | 'removeParticipant'
        | 'deleteTopic'
        | 'closeExpiredPair'
        | 'cancelSession'
        | 'deleteSession';
    }
  | { ok: true; action: 'listSessions'; sessions: HostedSessionSummary[] };

export type HostedParticipantActionRequest =
  | { action: 'joinGroup'; code: string; displayName: string }
  | { action: 'leaveGroup'; groupId: string }
  | {
      action: 'lockSubmission';
      groupId: string;
      sessionId: string;
      pairId: string;
      text: string;
    }
  | {
      action: 'submitResultFeedback';
      groupId: string;
      sessionId: string;
      pairId: string;
      rating: 'helpful' | 'unfair' | 'problem';
      issue?: string;
    };

export type HostedParticipantActionResult =
  | {
      ok: true;
      action: 'joinGroup';
      groupId: string;
      participantId: string;
    }
  | { ok: true; action: 'leaveGroup' }
  | { ok: true; action: 'lockSubmission'; bothLocked: boolean }
  | { ok: true; action: 'submitResultFeedback' };

export interface JudgeHostedPairRequest {
  groupId: string;
  sessionId: string;
  pairId: string;
  warm?: boolean;
}

export type JudgeHostedPairResult =
  | { status: 'verdict' }
  | { status: 'warm' }
  | { status: 'closed' }
  | { status: 'busy'; retryAfterMs: number };

export interface ExportHostedSessionRequest {
  groupId: string;
  sessionId: string;
}

export interface HostedSessionExport {
  disclosureVersion: string;
  exportedAt: string;
  groupName: string;
  session: {
    format: HostedSessionFormat;
    status: HostedSessionStatus;
    timer: HostedTimer;
    topic: {
      type: HostedTopicType;
      question: string;
      positionA: HostedPosition;
      positionB: HostedPosition;
      sources: Array<{ label: string | null; text: string }>;
    };
    participantCount: number;
    stageCount: number;
    champion: string | null;
    startedAt: string | null;
    completedAt: string | null;
  };
  participants: Array<{ ref: string; name: string }>;
  matches: Array<{
    stage: number;
    kind: 'debate' | 'bye';
    participants: Array<{
      ref: string;
      name: string;
      assignedPosition: HostedPositionKey | null;
      argument: string;
      feedback: {
        participant: string;
        scores: HostedCategoryScores | null;
        paragraph: string;
      } | null;
    }>;
    comparison: string | null;
    winner: string | null;
    resultKind: HostedVerdictKind | null;
    advancementReason: HostedAdvancementReason | null;
  }>;
}
