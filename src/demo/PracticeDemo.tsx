import { type ReactNode, useMemo, useState } from "react";
import { TopicEditor } from "../hosted/TopicEditor";
import type { HostedTopicInput } from "../shared/hostedTypes";

type Format = "single" | "tournament";
type Timer = "timed" | "untimed";
type Tour = "host" | "participant" | null;

const fixtureTopic: HostedTopicInput = {
  type: "twoPosition",
  question:
    "A fictional software team promised a Friday release. A recoverable bug affects about 1 in 20 first-time setups. Support has two people, and a fix can be ready Monday. What should the team do?",
  positionA: {
    text:
      "Release Friday with a clear workaround, active monitoring, and support ready to respond.",
    attribution: "Position A",
  },
  positionB: {
    text:
      "Delay until Monday, fix the bug, and protect customers’ first experience.",
    attribution: "Position B",
  },
  sources: [{
    id: "fictional-case-facts",
    label: "Fictional case facts",
    text:
      "The public Friday promise, recoverable 1-in-20 setup bug, two-person support team, and Monday fix are the complete fictional case facts.",
  }],
};

const sampleArguments = {
  maya:
    "Release Friday with the workaround visible from the first setup screen. Name the risk honestly, monitor it actively, and keep support ready so the promise remains credible.",
  jon:
    "Delay until Monday. A customer’s first experience sets the tone, and a two-person support team may not be able to protect that experience if several people need help at once.",
  rina:
    "Release on Friday if the workaround is tested end to end and the team commits to a clear update the moment the fix is available.",
  ari:
    "Delay until the known friction is fixed. A short, explained delay can preserve trust better than a launch that asks new customers to troubleshoot.",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const escaped: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return escaped[character] ?? character;
  });
}

function Page({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <main id="practice-content" className="demo-main">
      <div className="hosted-page-head">
        <div>
          <p className="hosted-kicker">Public demo · fictional data only</p>
          <h1>{heading}</h1>
        </div>
      </div>
      {children}
    </main>
  );
}

function TourStep(
  { tour, step, total }: {
    tour: Exclude<Tour, null>;
    step: number;
    total: number;
  },
) {
  return (
    <p className="demo-tour-step">
      {tour === "host" ? "Host tour" : "Participant tour"} · {step} of {total}
    </p>
  );
}

function Back(
  { onClick, label = "Back to group practice" }: {
    onClick: () => void;
    label?: string;
  },
) {
  return (
    <button className="quiet hosted-back" onClick={onClick}>← {label}</button>
  );
}

function ExerciseSummary(
  { topic, compact = false }: { topic: HostedTopicInput; compact?: boolean },
) {
  const exampleTopic = JSON.stringify(topic) === JSON.stringify(fixtureTopic);
  return (
    <section
      className={`demo-exercise ${compact ? "demo-exercise-compact" : ""}`}
    >
      <span className="demo-pill">Fictional practice exercise</span>
      <h2>
        {exampleTopic ? "Ship Friday or fix first?" : "Your custom practice"}
      </h2>
      <p>{topic.question}</p>
      {!compact && (
        <div className="demo-positions">
          <div>
            <b>{topic.positionA.attribution || "Position A"}</b>
            <span>{topic.positionA.text}</span>
          </div>
          <div>
            <b>{topic.positionB.attribution || "Position B"}</b>
            <span>{topic.positionB.text}</span>
          </div>
        </div>
      )}
    </section>
  );
}

function FullCase({ topic }: { topic: HostedTopicInput }) {
  return (
    <details className="demo-case-details">
      <summary>View the full case, other side, and sources</summary>
      <p className="demo-case-question">{topic.question}</p>
      <div className="demo-positions">
        <div>
          <b>{topic.positionA.attribution || "Position A"}</b>
          <span>{topic.positionA.text}</span>
        </div>
        <div>
          <b>{topic.positionB.attribution || "Position B"}</b>
          <span>{topic.positionB.text}</span>
        </div>
      </div>
      <div className="demo-source-list">
        <b>Sources</b>
        {topic.sources.length
          ? topic.sources.map((source) => (
            <p key={source.id}>
              <strong>{source.label || "Source"}:</strong> {source.text}
            </p>
          ))
          : <p>No sources are supplied for this custom topic.</p>}
      </div>
    </details>
  );
}

function PairDetails({ label, winner, scoreA, scoreB, first, second }: {
  label: string;
  winner: string;
  scoreA: number;
  scoreB: number;
  first: { name: string; argument: string };
  second: { name: string; argument: string };
}) {
  return (
    <details className="demo-pair-details">
      <summary>View {label} arguments and feedback</summary>
      <p>
        <strong>{winner} advanced.</strong>{" "}
        Preset outcome, not a grade of any typed draft or topic edit.
      </p>
      <div className="demo-argument-grid">
        <article>
          <h3>{first.name}</h3>
          <p>{first.argument}</p>
          <small>Preset rubric score: {scoreA}/40</small>
        </article>
        <article>
          <h3>{second.name}</h3>
          <p>{second.argument}</p>
          <small>Preset rubric score: {scoreB}/40</small>
        </article>
      </div>
      <p className="demo-fixed-copy">
        Fixed feedback: the advancing argument states a clear tradeoff, uses the
        fictional constraints, and responds directly to the competing concern.
      </p>
    </details>
  );
}

export function PracticeDemo(
  { screen, onNavigate, inspecting: _inspecting }: {
    screen: string;
    onNavigate: (screen: string) => void;
    inspecting?: boolean;
  },
) {
  const [tour, setTour] = useState<Tour>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [groupName, setGroupName] = useState("Friday Studio");
  const [joinCode, setJoinCode] = useState("FRIDAY");
  const [name, setName] = useState("Maya Chen");
  const [joinError, setJoinError] = useState("");
  const [topic, setTopic] = useState<HostedTopicInput>(fixtureTopic);
  const [format, setFormat] = useState<Format>("single");
  const [timer, setTimer] = useState<Timer>("timed");
  const [argument, setArgument] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [simulated, setSimulated] = useState(false);
  const [reflection, setReflection] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [sessionDeleted, setSessionDeleted] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const current = screen || "groups";
  const customTopic = JSON.stringify(topic) !== JSON.stringify(fixtureTopic);
  const outcomeVerb = format === "tournament" ? "advanced" : "won";
  const go = (route: string) => onNavigate(route);
  const heading = useMemo(() => ({
    groups: "Practice with your group",
    signin: "Host a group",
    group: groupName,
    topics: "Topic bank",
    setup: "Set up a practice",
    join: "Join a group",
    waiting: "You are in",
    writing: "Make your case",
    submitted: "Argument submitted",
    feedback: "Round feedback",
    monitor: "Session monitor",
    between: "Tournament final",
    results: "Session results",
    privacy: "Demo privacy note",
    deleted: "Fictional session deleted",
  }[current] ?? "Practice with your group"), [current, groupName]);

  function startTour(nextTour: Exclude<Tour, null>) {
    setTour(nextTour);
    go(nextTour === "host" ? "group" : "join");
  }
  function resetPractice() {
    setTour(null);
    setSignedIn(false);
    setGroupName("Friday Studio");
    setJoinCode("FRIDAY");
    setName("Maya Chen");
    setJoinError("");
    setTopic(fixtureTopic);
    setFormat("single");
    setTimer("timed");
    setArgument("");
    setSubmitted(false);
    setSimulated(false);
    setReflection("");
    setReflectionSaved(false);
    setSessionDeleted(false);
    setConfirmDelete(false);
    go("groups");
  }
  function submitJoin() {
    if (joinCode.trim().toUpperCase() !== "FRIDAY") {
      setJoinError("For this walkthrough, use the fictional code FRIDAY.");
      return;
    }
    if (!name.trim()) {
      setJoinError("Enter a display name to continue.");
      return;
    }
    setJoinError("");
    setTour("participant");
    go("waiting");
  }
  function deleteSession() {
    setArgument("");
    setSubmitted(false);
    setReflection("");
    setReflectionSaved(false);
    setSimulated(false);
    setSessionDeleted(true);
    setConfirmDelete(false);
    go("deleted");
  }
  function exportRecord() {
    const rows = [
      [
        "Pair 1",
        "Maya Chen",
        "Position A",
        format === "tournament" ? "Advanced" : "Won",
        "34/40",
        sampleArguments.maya,
      ],
      [
        "Pair 1",
        "Jon Bell",
        "Position B",
        "Lost",
        "30/40",
        sampleArguments.jon,
      ],
      [
        "Pair 2",
        "Rina Patel",
        "Position A",
        format === "tournament" ? "Advanced to final" : "Won",
        "33/40",
        sampleArguments.rina,
      ],
      [
        "Pair 2",
        "Ari Stone",
        "Position B",
        "Lost",
        "29/40",
        sampleArguments.ari,
      ],
    ];
    const participantRows = rows.map((
      [pair, participant, position, outcome, score, presetArgument],
    ) =>
      `<tr><td>${escapeHtml(pair)}</td><td>${escapeHtml(participant)}</td><td>${
        escapeHtml(position)
      }</td><td>${escapeHtml(outcome)}</td><td>${escapeHtml(score)}</td><td>${
        escapeHtml(presetArgument)
      }</td></tr>`
    ).join("");
    const ownDraft = argument
      ? `<p><strong>Ungraded browser-only draft by ${
        escapeHtml(name || "participant")
      }:</strong><br>${escapeHtml(argument)}</p>`
      : "";
    const final = format === "tournament"
      ? "<p><strong>Preset final:</strong> Maya Chen defeats Rina Patel, 35–32, and is the fictional champion.</p>"
      : "";
    const html =
      `<!doctype html><html lang="en"><meta charset="utf-8"><title>Fictional Verdict record</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:32px auto;line-height:1.45}table{border-collapse:collapse;width:100%}th,td{border:1px solid #bbb;padding:8px;text-align:left;vertical-align:top}</style><body><h1>Fictional Verdict session record</h1><p><strong>Group:</strong> ${
        escapeHtml(groupName)
      }<br><strong>Format:</strong> ${
        format === "tournament" ? "Tournament" : "Single round"
      }<br><strong>Topic:</strong> ${
        escapeHtml(topic.question)
      }</p><p>This file contains preset fictional participants, arguments, outcomes, scores, and feedback. It does not evaluate typed writing or custom topic edits.</p>${ownDraft}<h2>Preset pair records</h2><table><thead><tr><th>Pair</th><th>Participant</th><th>Assigned position</th><th>Preset outcome</th><th>Preset score</th><th>Preset argument</th></tr></thead><tbody>${participantRows}</tbody></table>${final}<h2>Preset feedback</h2><p>Pair 1 preset total: 34/40. Claim clarity: 9/10; source use: 9/10; response to other side: 8/10; internal consistency: 8/10.</p><p>The preset winning argument states a clear tradeoff, uses the fictional constraints, and responds directly to the competing concern.</p></body></html>`;
    const url = URL.createObjectURL(
      new Blob([html], { type: "text/html;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "fictional-verdict-record.html";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (
    sessionDeleted &&
    [
      "waiting",
      "writing",
      "submitted",
      "feedback",
      "monitor",
      "between",
      "results",
    ].includes(current)
  ) {
    return (
      <Page heading="Fictional session deleted">
        <section className="hosted-panel demo-narrow">
          <span className="demo-status">Session deleted</span>
          <h2>This fictional session is no longer available.</h2>
          <p>
            Its local argument and reflection were cleared. Start a fresh demo
            session to continue.
          </p>
          <button className="primary huge" onClick={resetPractice}>
            Start a fresh demo session
          </button>
          <button className="quiet huge" onClick={() => go("privacy")}>
            Read the data note
          </button>
        </section>
      </Page>
    );
  }

  let content: ReactNode;
  if (current === "groups") {
    content = (
      <>
        <p className="demo-intro-copy">
          Choose a guided point of view. Both tours use the same fictional group
          and stay only in this browser tab.
        </p>
        <section className="demo-role-grid">
          <article className="demo-role-card">
            <p className="hosted-kicker">Host a group</p>
            <h2>Set up a focused practice</h2>
            <p>
              Create a fictional group, choose a two-position exercise, watch
              two pairs write, and review preset results together.
            </p>
            <button className="primary huge" onClick={() => startTour("host")}>
              Take the host tour
            </button>
          </article>
          <article className="demo-role-card">
            <p className="hosted-kicker">Join a group</p>
            <h2>Make a case and reflect</h2>
            <p>
              Use the fictional code, receive a side, write an argument, and
              compare preset reasoning from both perspectives.
            </p>
            <button
              className="secondary huge"
              onClick={() => startTour("participant")}
            >
              Take the participant tour
            </button>
          </article>
        </section>
        <details className="demo-explore">
          <summary>Explore freely</summary>
          <div className="demo-shortcuts">
            <button className="quiet" onClick={() => go("signin")}>
              Host sign-in simulation
            </button>
            <button className="quiet" onClick={() => go("topics")}>
              Topic bank
            </button>
            <button className="quiet" onClick={() => go("privacy")}>
              Data note
            </button>
            <button
              className="quiet"
              onClick={() => {
                setGroupName("New practice group");
                go("group");
              }}
            >
              New fictional group
            </button>
          </div>
        </details>
      </>
    );
  } else if (current === "signin") {
    content = (
      <section className="hosted-panel demo-narrow">
        <Back onClick={() => go("groups")} />
        <h2>Try the host view</h2>
        <p>
          This only simulates sign-in. It does not contact Google or create an
          account.
        </p>
        <button
          className="primary huge"
          onClick={() => {
            setSignedIn(true);
            setTour("host");
            go("group");
          }}
        >
          Continue as demo host
        </button>
      </section>
    );
  } else if (current === "group") {
    content = (
      <>
        <TourStep tour="host" step={1} total={4} />
        <Back onClick={() => go("groups")} />
        <section className="hosted-dashboard-grid hosted-group-grid">
          <article className="hosted-panel">
            <h2>Your fictional group</h2>
            <p>
              {signedIn ? "Demo host view is active. " : ""}This group is local
              to the demo. Its name and code are never saved.
            </p>
            <label className="field">
              Group name<input
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                maxLength={80}
              />
            </label>
            <label className="field">
              Join code<input
                value="FRIDAY"
                readOnly
                className="participant-code-input"
              />
            </label>
            <button className="primary huge" onClick={() => go("setup")}>
              Set up this practice
            </button>
          </article>
          <article className="hosted-panel">
            <h2>Ready roster</h2>
            <div className="hosted-roster">
              <div className="hosted-roster-row">
                <strong>Maya Chen</strong>
                <span className="demo-status">Ready</span>
              </div>
              <div className="hosted-roster-row">
                <strong>Jon Bell</strong>
                <span className="demo-status">Ready</span>
              </div>
              <div className="hosted-roster-row">
                <strong>Rina Patel</strong>
                <span className="demo-status">Joined</span>
              </div>
              <div className="hosted-roster-row">
                <strong>Ari Stone</strong>
                <span className="demo-status">Joined</span>
              </div>
            </div>
            <button
              className="quiet"
              onClick={() => {
                setTour("participant");
                go("join");
              }}
            >
              Preview participant tour
            </button>
          </article>
        </section>
      </>
    );
  } else if (current === "topics") {
    content = (
      <>
        <Back onClick={() => go("groups")} />
        <section className="hosted-panel">
          <div className="hosted-panel-head">
            <div>
              <h2>Topic bank</h2>
              <p>
                These fields update this browser-only fictional exercise. Preset
                feedback never evaluates topic edits.
              </p>
            </div>
            <button
              className="secondary"
              onClick={() => setTopic(fixtureTopic)}
            >
              Restore example
            </button>
          </div>
          <TopicEditor value={topic} onChange={setTopic} />
          <button className="primary" onClick={() => go("setup")}>
            Use this fictional topic
          </button>
        </section>
      </>
    );
  } else if (current === "setup") {
    content = (
      <>
        <TourStep tour="host" step={2} total={4} />
        <Back onClick={() => go("group")} label="Back to group" />
        <section className="hosted-panel demo-setup">
          <h2>Choose the practice</h2>
          <ExerciseSummary topic={topic} />
          <fieldset className="hosted-segmented">
            <legend>Format</legend>
            <button
              className={format === "single" ? "active" : ""}
              onClick={() => setFormat("single")}
            >
              Single round
            </button>
            <button
              className={format === "tournament" ? "active" : ""}
              onClick={() => setFormat("tournament")}
            >
              Tournament
            </button>
          </fieldset>
          {format === "tournament" && (
            <p className="demo-notice">
              Tournament: the two semifinal winners meet in one preset final
              round.
            </p>
          )}
          <fieldset className="hosted-segmented">
            <legend>Writing time</legend>
            <button
              className={timer === "timed" ? "active" : ""}
              onClick={() => setTimer("timed")}
            >
              Timed · 5 min
            </button>
            <button
              className={timer === "untimed" ? "active" : ""}
              onClick={() => setTimer("untimed")}
            >
              Untimed
            </button>
          </fieldset>
          <button
            className="primary huge"
            onClick={() => {
              setSessionDeleted(false);
              setSimulated(false);
              go("monitor");
            }}
          >
            Start fictional session
          </button>
          <button className="quiet" onClick={() => go("topics")}>
            Edit topic
          </button>
          <button
            className="quiet"
            onClick={() => {
              setTour("participant");
              go("join");
            }}
          >
            Preview participant experience
          </button>
        </section>
      </>
    );
  } else if (current === "join") {
    content = (
      <section className="hosted-panel demo-narrow">
        <TourStep tour="participant" step={1} total={4} />
        <Back onClick={() => go("groups")} />
        <h2>Join {groupName}</h2>
        <p>
          Use the fictional code below. Nothing entered is transmitted or
          retained.
        </p>
        <label className="field">
          Fictional group code<input
            className="participant-code-input"
            value={joinCode}
            onChange={(event) => {
              setJoinCode(event.target.value.toUpperCase());
              setJoinError("");
            }}
            maxLength={6}
          />
        </label>
        <label className="field">
          Display name for this demo<input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setJoinError("");
            }}
            maxLength={30}
          />
        </label>
        {joinError && <p className="demo-error" role="alert">{joinError}</p>}
        <button className="primary huge" onClick={submitJoin}>
          Join fictional group
        </button>
        <button
          className="quiet"
          onClick={() => {
            setTour("host");
            go("monitor");
          }}
        >
          Return to host monitor
        </button>
      </section>
    );
  } else if (current === "waiting") {
    content = (
      <section className="hosted-panel demo-narrow">
        <TourStep tour="participant" step={2} total={4} />
        <span className="demo-status">Waiting for the host</span>
        <h2>Welcome, {name || "participant"}</h2>
        <p>
          When the host starts, each participant receives one of the two stated
          positions.
        </p>
        <ExerciseSummary topic={topic} compact />
        <button className="primary huge" onClick={() => go("writing")}>
          Simulate my assignment
        </button>
        <button className="quiet" onClick={() => go("join")}>
          Change display name
        </button>
      </section>
    );
  } else if (current === "writing") {
    content = (
      <section className="hosted-panel demo-writing">
        <TourStep tour="participant" step={3} total={4} />
        <div className="demo-assignment">
          <span className="demo-status">Your assigned side</span>
          <h2>{topic.positionA.text}</h2>
          {timer === "timed" && (
            <span className="demo-timer-note">Demo timer paused at 04:28</span>
          )}
        </div>
        <FullCase topic={topic} />
        <label className="field">
          Your argument<textarea
            aria-label="Your argument"
            value={argument}
            onChange={(event) => setArgument(event.target.value)}
            rows={6}
            maxLength={1200}
          />
        </label>
        <div className="demo-draft-actions">
          <p className="muted">
            {argument.length}/1200 characters · stays in this browser
          </p>
          <button
            className="primary"
            onClick={() => {
              setSubmitted(true);
              go("submitted");
            }}
          >
            Submit argument
          </button>
        </div>
        <button className="quiet" onClick={() => go("waiting")}>
          Return to waiting room
        </button>
      </section>
    );
  } else if (current === "submitted") {
    content = (
      <section className="hosted-panel demo-narrow">
        <span className="demo-status">Argument submitted</span>
        <h2>Your draft is locked for this fictional round.</h2>
        <p>
          Preset results are separate from the argument you typed and from any
          custom topic edits.
        </p>
        <button className="primary huge" onClick={() => go("feedback")}>
          Review preset feedback
        </button>
        <button
          className="quiet"
          onClick={() => {
            setArgument("");
            setSubmitted(false);
            go("writing");
          }}
        >
          Start a fresh demo attempt
        </button>
      </section>
    );
  } else if (current === "feedback") {
    content = (
      <section className="hosted-panel demo-feedback-page">
        <TourStep tour="participant" step={4} total={4} />
        <span className="demo-status">Preset round feedback</span>
        <h2>
          {customTopic
            ? "Separate sample: Ship Friday or fix first?"
            : `Why Position A ${outcomeVerb}`}
        </h2>
        <p className="demo-notice">
          These arguments, scores, and feedback are fixed fictional examples.
          They do not grade your draft or your custom topic.
        </p>
        <section className="demo-why">
          <h3>Why this side {outcomeVerb}</h3>
          <div className="demo-score-grid">
            <span>
              Claim clarity <b>9/10</b>
            </span>
            <span>
              Source use <b>9/10</b>
            </span>
            <span>
              Response to other side <b>8/10</b>
            </span>
            <span>
              Internal consistency <b>8/10</b>
            </span>
          </div>
          <p>
            <strong>Preset total: 34/40</strong>
          </p>
          <p>
            The preset Position A argument makes a clear tradeoff, uses the
            stated constraints, and names a condition for monitoring risk.
          </p>
        </section>
        <section className="demo-both-arguments">
          <h3>Both preset arguments</h3>
          <div className="demo-argument-grid">
            <article>
              <h3>Maya Chen · Position A</h3>
              <p>{sampleArguments.maya}</p>
            </article>
            <article>
              <h3>Jon Bell · Position B</h3>
              <p>{sampleArguments.jon}</p>
            </article>
          </div>
        </section>
        <section className="demo-other-perspective">
          <h3>What the other side makes stronger</h3>
          <p>
            Delay advocates reasonably emphasize that a first experience can be
            hard to recover and a two-person support team has a real capacity
            limit.
          </p>
        </section>
        <details className="demo-own-draft">
          <summary>See your ungraded browser-only draft</summary>
          <p>{argument || "(No argument entered)"}</p>
        </details>
        <label className="field">
          What did the other side make you reconsider?<textarea
            aria-label="What did the other side make you reconsider?"
            value={reflection}
            onChange={(event) => {
              setReflection(event.target.value);
              setReflectionSaved(false);
            }}
            rows={4}
          />
        </label>
        <div className="demo-draft-actions">
          <button
            className="secondary"
            onClick={() => {
              setReflection(
                "I need to weigh the cost of a difficult first experience more carefully.",
              );
              setReflectionSaved(false);
            }}
          >
            Use example
          </button>
          <button className="primary" onClick={() => setReflectionSaved(true)}>
            {reflectionSaved
              ? "Reflection saved in this demo"
              : "Save reflection"}
          </button>
        </div>
        <button className="quiet" onClick={() => go("results")}>
          See session results
        </button>
      </section>
    );
  } else if (current === "monitor") {
    const complete = simulated ? "4 of 4" : submitted ? "2 of 4" : "1 of 4";
    content = (
      <section className="hosted-panel">
        <TourStep tour="host" step={3} total={4} />
        <div className="hosted-panel-head">
          <div>
            <h2>{topic.question}</h2>
            <p>
              4 fictional participants · {format === "single"
                ? "Two pairs, one round"
                : "Two semifinals, then a final"} ·{" "}
              {timer === "timed" ? "5 minutes" : "Untimed"}
            </p>
          </div>
          <span className="demo-status">Writing</span>
        </div>
        <div className="demo-progress">
          <span
            style={{ width: simulated ? "100%" : submitted ? "50%" : "25%" }}
          />
        </div>
        <p>{complete} preset submissions complete.</p>
        <div className="hosted-action-row">
          <button className="secondary" onClick={() => setSimulated(true)}>
            Simulate submissions
          </button>
          {simulated
            ? (
              <button
                className="primary"
                onClick={() =>
                  go(format === "tournament" ? "between" : "results")}
              >
                Show preset results
              </button>
            )
            : (
              <button
                className="quiet"
                onClick={() =>
                  go(format === "tournament" ? "between" : "results")}
              >
                Skip to preset results
              </button>
            )}
          <button className="quiet" onClick={() => go("setup")}>
            Edit next session
          </button>
          <button
            className="quiet"
            onClick={() => {
              setTour("participant");
              go("join");
            }}
          >
            Preview participant experience
          </button>
        </div>
        <h3>Pairs</h3>
        <div className="hosted-roster">
          <div className="hosted-roster-row">
            <span>
              <strong>Maya Chen vs. Jon Bell</strong>
              <small>{simulated ? "both submitted" : "Pair 1 writing"}</small>
            </span>
            <b>{format === "tournament" ? "Semifinal 1" : "Pair 1"}</b>
          </div>
          <div className="hosted-roster-row">
            <span>
              <strong>Rina Patel vs. Ari Stone</strong>
              <small>{simulated ? "both submitted" : "Pair 2 writing"}</small>
            </span>
            <b>{format === "tournament" ? "Semifinal 2" : "Pair 2"}</b>
          </div>
        </div>
      </section>
    );
  } else if (current === "between") {
    content = (
      <section className="hosted-panel demo-narrow">
        <TourStep tour="host" step={4} total={4} />
        <span className="demo-status">Preset semifinals complete</span>
        <h2>Maya Chen and Rina Patel advance to the final.</h2>
        <p>
          Semifinal 1: Maya beat Jon, 34–30. Semifinal 2: Rina beat Ari, 33–29.
          The next action simulates their preset final, 35–32.
        </p>
        <button
          className="primary huge"
          onClick={() => {
            setFormat("tournament");
            go("results");
          }}
        >
          Simulate preset final
        </button>
        <button className="quiet" onClick={() => go("monitor")}>
          Return to monitor
        </button>
      </section>
    );
  } else if (current === "results") {
    content = (
      <section className="hosted-panel demo-results-page">
        <TourStep tour="host" step={4} total={4} />
        <div className="hosted-panel-head">
          <div>
            <h2>
              {format === "tournament"
                ? "Tournament complete"
                : "Two pairs complete"}
            </h2>
            <p>Fictional record · {topic.question}</p>
          </div>
          {format === "tournament" && (
            <span className="demo-champion">Champion: Maya Chen</span>
          )}
        </div>
        <p className="demo-notice">
          All results below are preset fictional data. They do not assess custom
          topic edits or typed writing.
        </p>
        <section className="demo-result-card">
          <h3>
            Pair 1 · Maya Chen won{" "}
            <span className="demo-score-nowrap">34–30</span>
          </h3>
          <p>
            {format === "tournament"
              ? "Maya advanced · Jon lost"
              : "Maya won · Jon lost"}
          </p>
          <PairDetails
            label="Pair 1"
            winner="Maya Chen"
            scoreA={34}
            scoreB={30}
            first={{
              name: "Maya Chen · Position A",
              argument: sampleArguments.maya,
            }}
            second={{
              name: "Jon Bell · Position B",
              argument: sampleArguments.jon,
            }}
          />
        </section>
        <section className="demo-result-card">
          <h3>
            Pair 2 · Rina Patel won{" "}
            <span className="demo-score-nowrap">33–29</span>
          </h3>
          <p>
            {format === "tournament"
              ? "Rina advanced to the final · Ari lost"
              : "Rina won · Ari lost"}
          </p>
          <PairDetails
            label="Pair 2"
            winner="Rina Patel"
            scoreA={33}
            scoreB={29}
            first={{
              name: "Rina Patel · Position A",
              argument: sampleArguments.rina,
            }}
            second={{
              name: "Ari Stone · Position B",
              argument: sampleArguments.ari,
            }}
          />
        </section>
        {format === "tournament" && (
          <section className="demo-result-card">
            <h3>
              Final · Maya Chen won{" "}
              <span className="demo-score-nowrap">35–32</span>
            </h3>
            <p>Maya is the fictional champion · Rina finished as finalist</p>
            <PairDetails
              label="Final"
              winner="Maya Chen"
              scoreA={35}
              scoreB={32}
              first={{ name: "Maya Chen", argument: sampleArguments.maya }}
              second={{ name: "Rina Patel", argument: sampleArguments.rina }}
            />
          </section>
        )}
        <div className="demo-result-actions">
          <button className="primary" onClick={() => go("setup")}>
            Start another fictional practice
          </button>
          <button className="secondary" onClick={exportRecord}>
            Download fictional HTML record
          </button>
          <button className="quiet" onClick={() => go("group")}>
            Return to group
          </button>
        </div>
        <details className="demo-session-management">
          <summary>Session management</summary>
          <p>
            The planned group-product policy lets hosts request earlier deletion
            before the 30-day retention limit. This demo has no server record.
          </p>
          {confirmDelete
            ? (
              <div className="demo-delete-confirm">
                <strong>
                  Delete this fictional session and its local draft/reflection?
                </strong>
                <div>
                  <button className="primary" onClick={deleteSession}>
                    Delete fictional session
                  </button>
                  <button
                    className="quiet"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )
            : (
              <button className="quiet" onClick={() => setConfirmDelete(true)}>
                Request earlier deletion
              </button>
            )}
        </details>
      </section>
    );
  } else if (current === "privacy") {
    content = (
      <section className="hosted-panel demo-narrow">
        <Back onClick={() => go("groups")} />
        <h2>What this demo does</h2>
        <p>
          This walkthrough runs in this browser tab. It does not send your name,
          writing, or click activity to Verdict, Google, or a third party.
        </p>
        <h3>Planned group-product policy</h3>
        <p>
          The planned group product policy is to retain session records for up
          to 30 days, then delete them. Hosts can request earlier deletion. This
          demo has no account or server record and resets with Reset demo or
          when the tab closes.
        </p>
      </section>
    );
  } else if (current === "deleted") {
    content = (
      <section className="hosted-panel demo-narrow">
        <span className="demo-status">Deleted from this browser demo</span>
        <h2>The fictional session was cleared.</h2>
        <p>
          The browser-only argument and reflection have been removed. No server
          record existed.
        </p>
        <button className="primary huge" onClick={resetPractice}>
          Start a fresh demo session
        </button>
        <button className="quiet" onClick={() => go("privacy")}>
          Read the data note
        </button>
      </section>
    );
  } else {
    content = (
      <section className="hosted-panel demo-narrow">
        <h2>This practice screen moved.</h2>
        <p>Use the guided tours or the screen picker above.</p>
        <button className="primary" onClick={() => go("groups")}>
          Group practice
        </button>
      </section>
    );
  }
  return (
    <div data-demo-tour={tour ?? undefined}>
      <Page heading={heading}>{content}</Page>
    </div>
  );
}
