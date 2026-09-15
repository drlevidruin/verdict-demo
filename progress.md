Original request: Publish a GitHub Pages demo of all Verdict features with fictional data, so other AIs can inspect and try it, then report their feedback.

Standalone public demo of the current Verdict interface. No backend credentials, services, or real records.

Built a standalone React/Vite hash-routed demo, with 35 named screens plus the collection page. Game and Practice interactions use component state only. Copied presentation components have public-demo wording; API configuration and credentials are absent. Public source contains only simulation code, shared presentation types/data, styles, and font assets/licenses.

Validation: production build and TypeScript pass. Browser flows cover required names, create/simulated join, timing, sample writing/results, stored-in-memory response, manual code validation, Practice join/writing/reflection, topic edits, tournament, HTML export, earlier deletion and reset. Independent desktop/phone route review passed all 36 routes. Direct browser requests stayed on the demo origin. Physical device and assistive-technology testing remain separate.

Review improvements addressed: neutral demo controls, persistent fictional labels, typing focus stability, timer state updates, accessible field labels, source/topic simulation clarity, escaped export, reset semantics, coherent tournament and deletion flows. Remaining refinement: fewer first-view Practice dashboard choices and more compact wide-screen result spacing.

Public release is authorized by the user specifically as a fictional GitHub Pages demo. Production app remains separate and private. No judge service is used by this demo.
