# Verification

Verified on 2026-11-09 in the development environment. Automated tests establish the behavior described below, not subjective polish or unmeasured physical-device performance.

## Engine and campaign

`npm test`: **147 passed**, four test files.

- 35 tests cover deterministic action streams, grass consumption and hunger, shared-food collision spacing, production cooldowns, planting/refills, successful and blocked collection, cats, expiration, every workshop conversion and timer, local upgrades, truck capacity and invalid cargo, exactly-once delivery credit, bear warnings/attacks/capture/escape, dog stun, goal semantics, completion freeze, medal boundaries, persistent upgrades, rescue, fixed-step timing, pause/catch-up limits, full save restoration and validation, reward deduplication and upgrade purchases.
- 101 tests run all twenty days under five deterministic player policies, with no permanent upgrades, and confirm the adverse bear scenario actually loses an animal and still finishes. The final campaign/profile matrix completed **100/100** scenarios within the 900-second per-day ceiling. Measured simulation campaigns span **45.15–47.62 minutes**. See `balance-results.json` and `BALANCE.md` for policy assumptions.

`npm run build`: **passed** strict TypeScript checking and Vite's static production build. Phaser is pinned to **4.2.1**. Output is approximately 1.50 MB JavaScript (413 KB gzip), 41 KB CSS (9 KB gzip), and a small HTML entry point; SVG assets are embedded and require no runtime service.

## Browser flows

`PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174 npm run test:e2e` against `npm run preview -- --port 5174`: **15 passed**. A previous WebGL software-rendering attempt exceeded its time limit; final repeatable tests use Phaser's supported Canvas renderer with Chromium GPU rendering disabled. They use Playwright virtual time to execute the real fixed-step updates and actual canvas/HTML clicks, without directly completing objectives or injecting output products/revenue.

| Viewport | Real first-day campaign flow | Production, bears and trade | Russian, rotation, fullscreen | Floating controls and purchases | Full structure bounds |
|---|---|---|---|---|---|
| Desktop, 1440 × 1000 | Passed | Passed | Passed | Passed | Passed |
| Phone landscape, 844 × 390 | Passed | Passed | Passed | Passed | Passed |
| Phone portrait, 390 × 844 | Passed | Passed | Passed | Passed | Passed |

The campaign flow starts from empty local storage, plants grass, lets a goose feed and produce, manually collects four eggs, completes the day, receives its medal/stars, returns to the map, buys an upgrade, starts day 2, saves, pauses, advances virtual time without farming, reloads, resumes, checks exact restored water/time, verifies retained campaign upgrades/rewards, tests the hidden-tab handler and checks horizontal overflow. It asserts there are no page runtime errors.

The production flow starts from a **valid interrupted final-day fixture**, with one egg, wool and milk and no animals, to isolate machinery. Through real canvas clicks and full configured timers it makes powder/thread/butter, picks them up, makes cake/cloth/cheese, cages and collects a scheduled bear, selects the three manufactured goods, dispatches an eight-slot delivery and checks that exactly 553 coins arrive once after the full trip. No direct engine mutation occurs after the fixture is loaded. This flow is intentionally not a claim that all twenty levels were manually played through the renderer; the campaign matrix covers their economics.

The complete campaign and production browser flows were rerun successfully after the Russian/adaptive-layout changes, including the final-day workshop/cage/truck flow in both phone orientations.

Screenshots of the map, farm, completion, upgrade shop, final-day workshops and selected market cargo are in `screenshots/` for all three viewports. The SVG-loading error found during development was corrected before release. Responsive navigation has explicit accessible labels, and touch devices get larger product hit regions.

## Deployment verification

The GitHub Actions Pages workflow runs locked dependency installation, the complete unit/campaign suite, the strict production build, artifact upload and Pages deployment. A successful deployment was verified at `https://kifrip.github.io/happy-farm-rush/` with an HTTP 200 response. Consult the repository's latest Actions run for the exact released commit.

## Remaining limitations

- Physical Android hardware, Safari and Firefox were not tested; headless Chromium viewports cannot establish performance on those devices.
- Campaign duration is a deterministic economic simulation estimate. Human playtesting is still needed to judge difficulty, discoverability and medal pacing. Policies know all stock and objective dependencies, even with delayed reactions.
- Artwork uses original SVG walk frames and state transforms rather than large hand-painted animation sheets. Background music is the user-supplied Breakfast in the Orchard MP3, replacing the synthesized ambient tone. These are deliberate lightweight presentation choices.
- Sixty maximum campaign stars buy selected upgrades, not the entire shop. Upgraded replays can finish faster than the initial 45–60-minute campaign target.

## Russian and immersive mobile update

The language/layout update adds seven unit tests: complete Russian coverage for all configured levels, animals, products, buildings and upgrades; Russian objective/count/timer formatting; English/idempotent translation; preserving a legacy active save and rewards while adding language; locale persistence and invalid-locale rejection. The current suite also includes four roadside-layout tests; total tests: **147**.

Three new browser cases verify Russian defaults, grass planting/egg collection after rotating the viewport, unchanged paused/restored farm time, language changes and persistence across reload, native fullscreen entry/exit when available, and reachable controls. On mobile they assert that the farm fills the viewport width, site chrome is hidden, and the canvas uses most of its height. These run alongside the campaign, production and floating-control cases: **15 unique browser cases passed**. In Chromium, native fullscreen entry and exit succeeded. The floating-control revision expands the canvas to the full available viewport: 390 × 844 in portrait and 844 × 390 in landscape, including the space behind the HUD. Native fullscreen can reclaim additional space from browser bars on supported devices.

Production screenshots for the update are `screenshots/ru-immersive-*.png`. This remains headless Chromium testing; a physical Android device and browser-specific fullscreen permissions are not implied by viewport emulation.

## Controls inside the farm

The latest three browser checks verify the late-level farm with every workshop and animal type unlocked. On phones, the canvas bounds exactly match the window, controls sit inside those bounds, interactive buttons do not cover one another, and the centers of all six workshops and the well still hit the canvas. Full sprite rectangles, including roofs and labels, are independently checked against every visible HUD card. The Animals panel successfully purchases a cow for 540 coins without planting grass or using water behind the panel. Paused farms retain their animal state when resizing through 320 × 740 and 740 × 320. Desktop keeps its existing layout and direct animal purchases.

The phone HUD uses floating cards at the top left, action controls at the right, and a floating purchase/delivery dock near the lower edge. Transparent gaps pass input to the scene. Roadside barn/truck placement fits above the dock, preserving proportions and shrinking only when the available space requires it. No simulation coordinates, campaign goals or save format changed in this update. Screenshots are in `screenshots/floating-controls-*.png`.

## Uncovered buildings regression

Four geometry tests cover unobstructed roadside placement, moving a warehouse above the dock, proportional fitting on short portrait windows, and ignoring controls outside the sprite’s horizontal span. Three additional browser cases measure Phaser’s actual full sprite and label bounds against visible, clipped HTML cards. They cover every workshop while processing and nine phone/tablet aspect ratios: 384 × 765, 390 × 700, 320 × 568, 430 × 740, 480 × 568, 600 × 600, 740 × 320, 844 × 390 and 1024 × 768. Portrait action buttons stay above the first workshop roof; landscape goals sit between the egg mill and well. Mobile processing captions retain time and batch size in a compact form.

Screenshots: `screenshots/uncovered-buildings-*.png` and the user-screenshot aspect ratio at `screenshots/clear-level5-384.png`. These are emulated Chromium viewports, not physical-device measurements.

## Supplied background music update

After replacing the oscillator with the owner-supplied MP3, `npm test` passed all 147 tests and `npm run build` succeeded. Three targeted Chromium cases (`music.spec.ts`) passed for desktop and both phone orientations: no audio element before interaction, actual MP3 decoding and advancing playback time, loop enabled, saved default music volume, pause/resume at the current position, hidden-tab pause and no runtime errors. The previous 15 browser cases were not rerun for this audio-only change. The supplied recording is preserved; these checks do not establish a musically seamless loop or physical-device sound quality.

## Continuous menu music

Music now continues across game dialogs and navigation, including pause and market panels. The simulation still pauses normally. The three updated music browser cases passed on desktop and both mobile orientations, verifying advancing playback through pause/resume and market menus plus hidden-tab audio suspension. All 147 unit tests and the strict production build also passed. Music remains gated by user interaction, mute, volume and browser-tab visibility.
