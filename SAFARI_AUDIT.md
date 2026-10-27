# Scroll verification — 27 October 2026

## Changes in this Safari-fix round

- Services uses one shared clip for the sharp stroke and bitmap halo, so the glow no longer ends before the sharp stroke. The halo is generated on geometry changes only; there is no live SVG blur or animated stroke dash.
- Services endpoints use layout width rather than transformed overflow, preventing extra trailing zigzags and inflated scroll travel.
- Progress-bar updates are coalesced into one requestAnimationFrame callback. Maximum scroll is measured on ScrollTrigger refresh rather than repeatedly during scrolling; unchanged width and accessibility values are not rewritten.
- Interrupted anchor glides cancel their previous tween and remove their input listeners. Effect cleanup cancels any remaining glide. Wheel/touch cancellation listeners are passive.
- Earlier changes retained: transform-based background streaks with static gradient halos, muted video readiness/gesture retries and offscreen pausing, accurate pixel header offset, compact Services cards, and a stacked layout below 700px viewport height.
- Smoothing remains 1.2 seconds and speed remains 1 / 1.5. Desktop Services timing constants remain unchanged.
- The temporary frame-timing component and import were removed after testing.

## Native browser evidence

Both browsers were tested on the local development server. A temporary overlay sampled requestAnimationFrame intervals while scrolling and for 1.5 seconds after scroll activity. “Services” counts only samples while its main pin trigger was active.

| Pass | Viewport | Samples | Median / p95 | Frames >32ms | Services samples / p95 / >32ms |
| --- | --- | --- | --- | --- | --- |
| Chrome, native page-scroll calls, whole page | 1654 × 969 | 644 | 16.7 / 17.4ms | 0 | Not separately counted |
| Safari, Page Down, first whole-page pass | 1710 × 998 | 1079 | 17 / 18ms | 7 | Not separately counted |
| Chrome, Page Down, whole page | 1654 × 969 | 990 | 16.7 / 17.6ms | 0 | 119 / 17.6ms / 0 |
| Safari, Page Down, second whole-page pass | 1710 × 998 | 793 | 17 / 21ms | 4 | 118 / 21ms / 1 |
| Safari, same second pass plus reverse traversal to Services | 1710 × 998 | 1351 | 17 / 20ms | 6 | 118 / 21ms / 1 |

The final reverse-traversal screenshot updated to 1382 total samples and 123 Services samples; p95 and slow-frame counts remained unchanged. Native Safari visibly rendered the shared cyan glow. Both browsers reached the actual page bottom with the progress bar at 100%. Reverse traversal returned correctly to the pinned Services cards.

Raw screenshot evidence is stored in temporary files:
- /tmp/portfolio-chrome-scroll-check.png
- /tmp/portfolio-chrome-matched-scroll.png
- /tmp/portfolio-safari-scroll-check.png
- /tmp/portfolio-safari-services-check.png

## Local development issue

The existing dev server logged a missing .next/dev/server/app/page/build-manifest.json and a fresh Safari load stalled. The verified portfolio server was restarted; subsequent fresh requests returned HTTP 200. Regenerating Next route types also cleared stale gallery route type errors after the gallery removal. Neither was attributed to the smooth-scrolling algorithm.

## Verdict and limits

After removing the sampler, ESLint, TypeScript, git diff whitespace checks and the webpack production build passed. Production smoke testing returned HTTP 200 for / and HTTP 404 for the removed /gallery route. The cleaned-up production page had no captured browser console errors during the Services navigation smoke test. The development server is restarted after the temporary production smoke test; no deployment, commit or push was performed.

Chrome was consistently smooth in these samples. Safari was mostly consistent but still had occasional slow frames, including one during Services. This is not proof of perfect parity or zero stutter. There is no controlled same-input, same-viewport before/after pair for the newest optimizations, so no percentage improvement is claimed.

These are development-server frame-interval observations, not production GPU paint traces or physical trackpad latency measurements. The viewports differ. Browser extensions, background applications, power mode, physical input and device performance can affect results. Mobile Safari and every secondary route were not exhaustively tested.
