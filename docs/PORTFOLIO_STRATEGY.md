# Portfolio Plan

## Core idea

Build one portfolio with two switchable experiences:

- **Simple mode:** A fast, professional portfolio that recruiters can scan easily.
- **AI mode:** An interactive assistant that answers questions about Aaryan.

A clearly labelled switch in the header will move between the two modes.

## Confirmed decisions

- Both modes will use the same projects, skills, résumé, education, contact details, and LeetCode data.
- AI answers will use only approved information about Aaryan.
- The assistant must not invent experience or achievements.
- The themed experience will use a cinematic image sequence supplied as a ZIP, not an MP4.
- The extracted frames will render on a canvas and advance with the visitor's scroll.
- GSAP with ScrollTrigger will control frame scrubbing, pinned content, and section transitions.
- Reduced-motion visitors will receive a stable, non-scrubbed alternative.
- Light/dark theme and Simple/AI mode will remain separate controls.
- Simple mode is currently the recommended default.

## Still to decide

- Final names for the two modes
- AI mode layout and visual style
- AI personality and answer length
- AI provider and budget
- Whether projects appear inside chat, beside chat, or both
- Exact behavior of the mode switch

## Next step

Decide what visitors should see immediately after switching to AI mode.

## Decision log

- **2026-09-14:** Chose Simple and AI portfolio modes.
- **2026-09-14:** Chose a top-level mode switch.
- **2026-09-14:** AI answers will be grounded in Aaryan's professional information.
- **2026-09-14:** Chose GSAP and ScrollTrigger for the cinematic scroll experience.
- **2026-09-14:** Chose a zipped image sequence instead of an MP4 for frame-accurate scrolling.
