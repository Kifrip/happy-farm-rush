# Verification

Verified on 2026-11-08 in the development environment. Automated tests establish the behavior described below, not subjective polish or unmeasured physical-device performance.

## Engine and campaign

`npm test`: **136 passed**, two test files.

- 35 tests cover deterministic action streams, grass consumption and hunger, shared-food collision spacing, production cooldowns, planting/refills, successful and blocked collection, cats, expiration, every workshop conversion and timer, local upgrades, truck capacity and invalid cargo, exactly-once delivery credit, bear warnings/attacks/capture/escape, dog stun, goal semantics, completion freeze, medal boundaries, persistent upgrades, rescue, fixed-step timing, pause/catch-up limits, full save restoration and validation, reward deduplication and upgrade purchases.
- 101 tests run all twenty days under five deterministic player policies, with no permanent upgrades, and confirm the adverse bear scenario actually loses an animal and still finishes. The final campaign/profile matrix completed **100/100** scenarios within the 900-second per-day ceiling. Measured simulation campaigns span **45.15–47.62 minutes**. See `balance-results.json` and `BALANCE.md` for policy assumptions.

`npm run build`: **passed** strict TypeScript checking and Vite's static production build. Phaser is pinned to **4.2.1**. Output is approximately 1.46 MB JavaScript (398 KB gzip), 30 KB CSS (7 KB gzip), and a small HTML entry point; SVG assets are embedded and require no runtime service.

## Browser flows

`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174 npm run test:e2e` against `npm run preview -- --port 5174`: **six passed**. A previous WebGL software-rendering attempt exceeded its time limit; final repeatable tests use Phaser's supported Canvas renderer with Chromium GPU rendering disabled. They use Playwright virtual time to execute the real fixed-step updates and actual canvas/HTML clicks, without directly completing objectives or injecting output products/revenue.

| Viewport | Real first-day campaign flow | Production, bears and trade |
|---|---|---|
| Desktop, 1440 × 1000 | Passed | Passed |
| Phone landscape, 844 × 390 | Passed | Passed |
| Phone portrait, 390 × 844 | Passed | Passed |

The campaign flow starts from empty local storage, plants grass, lets a goose feed and produce, manually collects four eggs, completes the day, receives its medal/stars, returns to the map, buys an upgrade, starts day 2, saves, pauses, advances virtual time without farming, reloads, resumes, checks exact restored water/time, verifies retained campaign upgrades/rewards, tests the hidden-tab handler and checks horizontal overflow. It asserts there are no page runtime errors.

The production flow starts from a **valid interrupted final-day fixture**, with one egg, wool and milk and no animals, to isolate machinery. Through real canvas clicks and full configured timers it makes powder/thread/butter, picks them up, makes cake/cloth/cheese, cages and collects a scheduled bear, selects the three manufactured goods, dispatches an eight-slot delivery and checks that exactly 553 coins arrive once after the full trip. No direct engine mutation occurs after the fixture is loaded. This flow is intentionally not a claim that all twenty levels were manually played through the renderer; the campaign matrix covers their economics.

After the final animal-spacing adjustment, the new shared-food regression, complete 136-test engine/campaign suite, production build, and a populated day-17 browser smoke were rerun successfully. The six full browser flows were last run immediately before this spacing-only adjustment.

Screenshots of the map, farm, completion, upgrade shop, final-day workshops and selected market cargo are in `screenshots/` for all three viewports. The SVG-loading error found during development was corrected before release. Responsive navigation has explicit accessible labels, and touch devices get larger product hit regions.

## Deployment verification

The GitHub Actions Pages workflow runs locked dependency installation, the complete unit/campaign suite, the strict production build, artifact upload and Pages deployment. A successful deployment was verified at `https://kifrip.github.io/happy-farm-rush/` with an HTTP 200 response. Consult the repository's latest Actions run for the exact released commit.

## Remaining limitations

- Physical Android hardware, Safari and Firefox were not tested; headless Chromium viewports cannot establish performance on those devices.
- Campaign duration is a deterministic economic simulation estimate. Human playtesting is still needed to judge difficulty, discoverability and medal pacing. Policies know all stock and objective dependencies, even with delayed reactions.
- Artwork uses original SVG walk frames and state transforms rather than large hand-painted animation sheets. Ambient audio is a quiet synthesized tone rather than a composed soundtrack. These are deliberate lightweight presentation choices.
- Sixty maximum campaign stars buy selected upgrades, not the entire shop. Upgraded replays can finish faster than the initial 45–60-minute campaign target.
