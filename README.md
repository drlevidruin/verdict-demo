# Verdict interactive demo

[Open the demo](https://drlevidruin.github.io/verdict-demo/) · [Review guide](https://drlevidruin.github.io/verdict-demo/review-guide.html)

A public, fictional walkthrough of Verdict. Play a quick debate against a simulated friend, browse topics, or explore group practice from the host and participant perspectives. Two guided Practice tours cover the host and participant experiences. Reviewer tools opens fresh examples of individual states, including results and recovery cases.

## What is real in this demo

The UI, navigation, editable forms, local interaction state, and fictional export work in the browser. No account, server, Firebase service, API key, analytics integration, or paid AI call is connected. Inputs stay in React memory. Refresh, Reset demo, or choosing a screen in Reviewer tools clears your edits and restores the fictional examples. Ordinary in-flow navigation keeps the current walkthrough state. Directly opened timer screens wait for you to start them; a guided game keeps its three-second countdown and sixty-second round, with demo pause controls. Copying a link shares a screen, not a room or the content you typed.

Names, arguments, scores, and judging feedback are made-up examples. **Sample verdicts do not grade user input.** The opposing player and all group participants are simulations. This demo is for judging clarity and product flow, not AI judgment quality or live multiplayer reliability.

The actual product direction includes two-person games and hosted group practice. Solo rehearsal, salary negotiation coaching, and relationship counseling are future ideas, not implemented features. A reflection exercise illustrates seeing another perspective; it is not therapy or professional advice.

## Review it

[Decisions from five external AI reviews](REVIEW_SYNTHESIS.md) explain which suggestions were implemented and which were rejected after checking the current build.

Start at the [review guide](public/review-guide.md). It includes a route index, a suggested walkthrough, and a concise prompt to give another AI. Report what you actually tried and the screen URL. Distinguish product feedback from demo limitations.

## Run locally

Requires Node 22 and npm.

```sh
npm ci
npm run dev
```

Open the printed local URL with `/verdict-demo/` appended. `npm run build` typechecks and produces a static `dist` directory. `npm run preview` serves the built demo at port 4174. The GitHub Pages workflow publishes `dist` from `main`. Hash-based screen links remain valid on refresh.

## Scope and source

This separate demo repository contains presentation components adapted from Verdict and standalone simulation controllers. The private working application's backend, credentials, records, and Git history are not included. Changes here do not change the working product.

Self-hosted Fredoka and Montserrat fonts use the SIL Open Font License; the licenses are in `public/fonts/`.
