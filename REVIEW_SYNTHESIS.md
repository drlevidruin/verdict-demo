# Review decisions

Five supplied reviews were compared against the current demo and its source. Repeated, reproducible observations carried more weight than the number of reviewers recommending the same visual preference.

## The useful signal

The strongest agreement is about sequencing: Practice offers too many initial choices; writing repeats reference material; feedback and the other side's argument are hidden; the demo's shortcuts can be confused with actual gameplay. Specific source and browser observations also identify timer/navigation collisions, deterministic “Surprise me,” ambiguous failure states, incomplete exports, and contrast issues.

| Decision | Change and reason |
| --- | --- |
| Accept: simplify Practice entry | Two guided role paths, with advanced exploration secondary. A visitor should not have to invent their own walkthrough. |
| Accept: show the payoff | Put short coaching and both sample arguments in the normal reading order. Keep the full numeric breakdown optional and the winner immediately visible. |
| Accept: focus mobile writing | Show the assignment once, collapse full case and sources, and keep Submit next to the editor. |
| Accept: predictable demo exploration | Move screen tools into Reviewer tools; each selected screen opens a clean fixture. Pause timers while inspecting and provide explicit timing controls. |
| Accept: clear next actions | Make simulated joining and sample reveal easy to advance; distinguish copying a demo link from a real invitation. |
| Accept: accurate results | Name actual sample outcomes, expose each pair's reasoning, export all displayed participants, explain tournament progression, and confirm deletion. |
| Accept: concrete defects | Fix random-topic selection, repeated next-round questions, expired-invite joining, unavailable-judge headings, ambiguous field names, heading structure, and missing favicon. |
| Accept: improve contrast | Darken primary-button red slightly while keeping the palette. White text on #d13e27 is 4.74:1; the earlier #e8452b combination was 3.95:1. Disabled buttons also get readable labels. |

## Suggestions not adopted

- **Forced dramatic reveals, flashing badges, sound, or additional animations:** add waiting and visual noise, conflicting with the requested calm, simple experience.
- **Make all feedback a mandatory gate before continuing:** the useful content should be visible, but a friendly game should not force a reading task.
- **Add solo coaching or remove tournaments:** neither follows from the usability problems. Keep the current product scope and explain the existing tournament better.
- **Let submitted arguments be edited until time expires:** changes the game's locking rule and would teach a misleading interaction in this public simulation.
- **Treat prewritten feedback as feedback on the visitor's writing:** false. Sample authors and arguments remain distinct from the visitor's ungraded draft.
- **Add a floating bottom action bar everywhere:** prior layouts had overlapping controls. Improve reading order and editor proximity before adding overlays.
- **Fix missing character counts, missing submitted states, audio playback, or horizontally scrolling bracket trees:** the first two already exist; the latter two are not present in this build. Those claims were not accepted as evidence.

## Weight of the evidence

Claude supplied the most reproducible browser and source findings, including exact timer behavior, contrast measurements, the incomplete export, and the mismatch between home and library randomness. Grok supplied a useful mixed-state reproduction. Perplexity clearly disclosed that its review was based on source and supplied images, which still supported the sequencing recommendations. Muse supplied practical runtime observations, but its proposed wording for ungraded writing would reduce honesty. Several Gemini links and descriptions did not correspond to actual demo screens, so their claims were checked individually rather than adopted wholesale.

The contrast threshold is grounded in [W3C's contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). This measurement is not a claim of full accessibility compliance. Physical-device and screen-reader acceptance remain separate.

This round updates the fictional public demo. It does not turn simulated judging, multiplayer, or storage into production services.

## Verification of the changes

The production build passed. All 36 screens were checked at 320, 390, and 1440 pixels with no overflow, runtime errors, missing main headings, or unlabeled form fields. Seven browser scenarios passed, including complete matches, topic changes/rematches, paused review timers, recovery, custom Practice topics, tournament export, and deletion. The gallery and review guide were refreshed. See [review evidence](REVIEW.md) and the [check summary](VERIFICATION.json).
