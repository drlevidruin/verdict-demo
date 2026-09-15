export const GAME_SCREENS = [
  ['home', 'Start or join'], ['topics', 'Topic library'], ['invite', 'Invitation'],
  ['lobby', 'Waiting for a friend'], ['lobby-full', 'Ready together'], ['countdown', 'Countdown'],
  ['writing', 'Write an argument'], ['locked', 'Submitted'], ['deliberating', 'Sample judging'],
  ['verdict', 'Round result'], ['match', 'Match result'], ['verdict-loss', 'Other player wins'],
  ['unavailable', 'Judge unavailable'], ['forfeit', 'Empty submission'],
  ['dq', 'Disqualification'], ['offline', 'Connection interrupted'],
  ['timeup', 'Time is up'], ['invite-error', 'Invitation expired'], ['tie', 'Tied round'], ['error', 'Submission error'],
] as const;
export const PRACTICE_SCREENS = [
  ['groups', 'Group dashboard'], ['signin', 'Host sign-in'], ['group', 'Group and roster'],
  ['topics', 'Topic bank'], ['setup', 'Session setup'], ['join', 'Join a group'],
  ['waiting', 'Participant waiting'], ['writing', 'Participant writing'], ['submitted', 'Submitted'],
  ['feedback', 'Participant feedback'], ['monitor', 'Host monitor'], ['results', 'Results and export'],
  ['between', 'Tournament next round'], ['deleted', 'Session deleted'], ['privacy', 'Retention and deletion'],
] as const;
export const screenLabel = (route: string) => {
 const [mode, screen] = route.split('/');
 return (mode === 'game' ? GAME_SCREENS : PRACTICE_SCREENS).find(([key]) => key === screen)?.[1] ?? 'All demos';
};
