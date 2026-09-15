# Demo review notes

This review concerns the fictional public demo. It does not establish production readiness.

## Changes after the external reviews

The five supplied AI reviews were checked against the current browser experience and source. [Review decisions](REVIEW_SYNTHESIS.md) records the accepted changes and rejected suggestions.

The clearest findings were too many competing Practice entry points, buried feedback, timer interruptions during review, unclear simulated actions, and inconsistent results. Practice now has two guided role tours. Short coaching appears before the next-round action, with both sample arguments visible below. Reviewer tools opens isolated examples and timers wait for an explicit start. A guided game retains its normal countdown and writing clock.

Random topics, next-round topic rotation, topic changes, rematches, required names, failure recovery, score consistency, complete tournament export, deletion confirmation, accessible labels, button contrast, and mobile score wrapping were corrected.

## Validation

- TypeScript and Vite production build passed.
- All 36 screens were opened at 320, 390, and 1440 pixels: 108 screen checks.
- No horizontal overflow, runtime errors, missing main headings, or unlabeled form fields in that route audit.
- Seven complete browser scenarios passed, covering varied Surprise topics, paused/direct and normal timers, a three-round match and rematch, changing the next topic, named joining and failure recovery, both Practice roles, custom topic edits, reflection, tournament, escaped four-participant export, deletion, and mobile keyboard/reading order.
- A separate Sol visual reviewer checked desktop and phone layouts. Its final findings about next-action placement, state wording, pair-specific labels, and score wrapping were implemented.
- Primary-button white text measures 4.74:1 against the revised red. This is not a full accessibility certification.
- Nine public gallery screenshots were refreshed. The required game browser client screenshot and text state were also inspected.

[Machine-readable check summary](VERIFICATION.json)

## Limits

The demo uses preset fictional judging, simulated participants, and in-memory edits. These checks cannot establish live multiplayer reliability, AI judging quality, or retention enforcement. Physical-device and screen-reader acceptance remain separate.
