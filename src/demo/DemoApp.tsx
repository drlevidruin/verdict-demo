import { useCallback, useEffect, useRef, useState } from 'react';
import { GameDemo } from './GameDemo';
import { PracticeDemo } from './PracticeDemo';
import { GAME_SCREENS, PRACTICE_SCREENS, screenLabel } from './catalog';

function currentRoute() { return window.location.hash.replace(/^#\/?/, '') || ''; }
function DemoHome({ go }: { go: (route: string) => void }) {
 return <main id="demo-content" className="demo-home" tabIndex={-1}>
  <div className="demo-intro"><p className="prompt-kicker">A little debate. A new perspective.</p>
   <h1>Try Verdict.</h1><p>Make your case. Hear the other side. Explore a friendly game or a focused group exercise.</p>
   <div className="demo-assurance">Fictional examples · No account needed · No live AI calls</div>
  </div>
  <div className="demo-paths">
   <section className="demo-path"><span className="demo-path-number">01 / PLAY</span><h2>A friendly debate</h2>
    <p>Get an assigned side of a silly question, write your argument, and explore a sample verdict. A simulated friend joins you.</p>
    <button className="primary huge" onClick={() => go('game/home')}>Try a game <span aria-hidden>→</span></button>
    <button className="quiet" onClick={() => go('game/verdict')}>Skip to a sample result</button></section>
   <section className="demo-path"><span className="demo-path-number">02 / PRACTICE</span><h2>See another side</h2>
    <p>Host a fictional group, try a participant’s experience, and review the reasoning on both sides.</p>
    <button className="secondary huge" onClick={() => go('practice/groups')}>Explore group practice <span aria-hidden>→</span></button>
    <button className="quiet" onClick={() => go('practice/feedback')}>Skip to sample feedback</button></section>
  </div>
  <details className="demo-screen-index"><summary>Explore every demo screen</summary>
   <div className="demo-index-columns">{[['Play', 'game', GAME_SCREENS], ['Group practice', 'practice', PRACTICE_SCREENS]].map(([label, group, screens]) =>
    <section key={String(group)}><h3>{String(label)}</h3><ul>{(screens as typeof GAME_SCREENS | typeof PRACTICE_SCREENS).map(([id, title]) => <li key={id}><a href={`#${group}/${id}`}>{title}</a></li>)}</ul></section>)}
   </div>
  </details>
  <section className="demo-about"><h2>Made for exploring.</h2><p>These are working interactions with made-up people and prewritten outcomes. Typed arguments are not graded. Everything you enter stays in this page’s memory and resets when you refresh. Use fictional details.</p>
   <p>The working product supports two-person games and hosted group practice. Solo coaching, meeting rehearsal, and relationship guidance are future ideas, not available features in this demo.</p>
   <div className="demo-links"><a href="review-guide.html">Review guide for people and AIs</a><a href="https://github.com/drlevidruin/verdict-demo">View demo source on GitHub</a></div>
  </section>
 </main>;
}

export default function DemoApp() {
  const [route, setRoute] = useState(currentRoute);
  const [generation, setGeneration] = useState(0);
  const [inspecting, setInspecting] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [copied, setCopied] = useState('');
  const pendingRoute = useRef<string | null>(null);
  const previousRoute = useRef(route);

  const navigate = useCallback((next: string, inspect = false) => {
    setInspecting(inspect);
    if (inspect) setGeneration(value => value + 1);
    if (currentRoute() === next) {
      pendingRoute.current = null;
      setRoute(next);
    } else {
      pendingRoute.current = next;
      window.location.hash = next;
    }
  }, []);
  const go = useCallback((next: string) => navigate(next), [navigate]);
  const goGame = useCallback((next: string) => go(next.startsWith('practice/') ? next : `game/${next}`), [go]);
  const goPractice = useCallback((next: string) => go(`practice/${next}`), [go]);

  useEffect(() => {
    const change = () => {
      const next = currentRoute();
      if (pendingRoute.current !== next) {
        setInspecting(true);
        setGeneration(value => value + 1);
      }
      pendingRoute.current = null;
      setRoute(next);
    };
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);

  useEffect(() => {
    document.title = `${route ? screenLabel(route) : 'Explore'} · Verdict demo`;
    setCopied('');
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (previousRoute.current !== route || generation > 0) {
      document.querySelector<HTMLElement>('#demo-content')?.focus({ preventScroll: true });
      previousRoute.current = route;
    }
  }, [route, generation]);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    const [mode, selected] = route.split('/');
    if (mode === 'game' && GAME_SCREENS.some(([id]) => id === selected)) return;
    const render = () => JSON.stringify({
      demo: true, route: currentRoute(), coordinateSystem: 'DOM layout; origin top-left, x right, y down',
      headings: Array.from(document.querySelectorAll('h1,h2')).map(x => x.textContent).slice(0, 8),
      visibleText: (document.querySelector('#demo-content')?.textContent ?? '').slice(0, 3500),
      controls: Array.from(document.querySelectorAll('button')).filter(x => x.getClientRects().length)
        .map(x => ({ label: x.textContent, disabled: x.disabled })).slice(0, 20),
    });
    w.render_game_to_text = render;
    return () => { if (w.render_game_to_text === render) delete w.render_game_to_text; };
  }, [route]);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.advanceTime = (ms: number) => window.dispatchEvent(new CustomEvent('verdict:advance-time', { detail: ms }));
    return () => { delete w.advanceTime; };
  }, []);

  const [group, screen = 'home'] = route.split('/');
  const known = route === '' || (group === 'game' && GAME_SCREENS.some(([id]) => id === screen))
    || (group === 'practice' && PRACTICE_SCREENS.some(([id]) => id === screen));
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied('Screen link copied. It opens a fresh example, without your edits.');
    } catch {
      setCopied('Copy this page’s address from your browser to share this screen.');
    }
  };

  return <>
    <a className="demo-skip" href="#demo-content" onClick={event => {
      event.preventDefault(); document.getElementById('demo-content')?.focus();
    }}>Skip to demo</a>
    <header className="demo-toolbar">
      <a className="demo-wordmark" href="#" onClick={event => { event.preventDefault(); go(''); }}>
        VER<span>DICT</span><small>DEMO</small>
      </a>
      <span className="demo-fictional">Fictional data · No live AI</span>
      <nav aria-label="Demo navigation">
        <button className="quiet" onClick={() => go('')}>All demos</button>
        <button className="quiet" aria-expanded={toolsOpen} aria-controls="reviewer-tools"
          onClick={() => setToolsOpen(open => !open)}>Reviewer tools</button>
      </nav>
    </header>
    <section id="reviewer-tools" className="demo-reviewer-panel" aria-label="Reviewer tools" hidden={!toolsOpen}>
      <div className="demo-reviewer-panel__controls">
        <label className="demo-jump">Explore a screen
          <select aria-label="Jump to a demo screen" value={known ? route : ''} onChange={event => {
            navigate(event.target.value, true); setToolsOpen(false);
          }}>
            <option value="">All demos</option>
            <optgroup label="Play">{GAME_SCREENS.map(([id, label]) => <option key={id} value={`game/${id}`}>{label}</option>)}</optgroup>
            <optgroup label="Group practice">{PRACTICE_SCREENS.map(([id, label]) => <option key={id} value={`practice/${id}`}>{label}</option>)}</optgroup>
          </select>
        </label>
        <button className="quiet" onClick={() => void share()}>Copy screen link</button>
        {route && <button className="quiet" onClick={() => {
          navigate(group === 'practice' ? 'practice/groups' : 'game/home', true); setToolsOpen(false);
        }}>Reset demo</button>}
        <a href="review-guide.html">Review guide</a>
      </div>
      <p>Opening a screen restores a fresh fictional example and replaces your in-progress edits. Timers wait until you start them.</p>
    </section>
    {copied && <p className="demo-copy-status" role="status">{copied}</p>}
    {!known ? <main id="demo-content" className="demo-home" tabIndex={-1}>
      <h1>This demo screen moved.</h1><p>Choose a screen in Reviewer tools or return to the demo collection.</p>
      <button className="primary" onClick={() => go('')}>All demos</button>
    </main> : !route ? <DemoHome go={go} /> : <div id="demo-content" className="demo-stage" tabIndex={-1}>
      {group === 'game'
        ? <GameDemo key={`game-${generation}`} screen={screen} inspecting={inspecting} onNavigate={goGame} />
        : <PracticeDemo key={`practice-${generation}`} screen={screen} onNavigate={goPractice} />}
    </div>}
    <footer className="demo-footer"><span>Interactive preview. Sample outcomes, not an assessment.</span><a href="review-guide.html">What to review</a></footer>
  </>;
}
