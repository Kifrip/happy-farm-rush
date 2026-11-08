# Happy Farm Rush

An original, self-contained 2D farm time-management game inspired by the gameplay of classic Farm Frenzy. Twenty individual days take a small goose pasture through three production chains, market deliveries, bears, and a persistent campaign. No accounts, server, ads, paid services, or runtime network dependencies.

## Play locally

Requires Node.js 22.12+ (tested with Node 24) and npm.

```sh
npm install
npm run dev
```

Open the address Vite prints. Tap empty pasture to grow grass, products to collect, a workshop to process, and the warehouse to select a shipment. Tap bears repeatedly to cage them, then tap the cage to collect it. Space / Escape pauses. Use the in-game handbook for the complete rules.

```sh
npm test                 # deterministic simulation and persistence tests
npm run build            # strict TypeScript check and static production build
npm run preview          # preview dist/
npm run balance          # 100 deterministic campaign/profile simulations
npm run test:e2e         # desktop, phone landscape, phone portrait
```

Browser tests expect a running Vite server on port 5173. They use `/usr/bin/chromium` by default. Set `CHROMIUM_PATH` to your local Chrome/Chromium executable, or install Chromium via `npx playwright install chromium` and set its executable path. Screenshots are written to `screenshots/`. Browser tests use `?renderer=canvas` for reproducible headless rendering; normal play uses Phaser's automatic renderer selection (WebGL when available). Both render the same authoritative simulation.

## Deployment

GitHub Pages URL: **https://kifrip.github.io/happy-farm-rush/**

The repository includes `.github/workflows/pages.yml`: a push to `main` installs locked dependencies, runs unit tests and the strict production build, uploads `dist/`, and deploys through GitHub Pages. Repository Settings → Pages must use **GitHub Actions**. All asset paths are relative, so the site supports the repository subpath. Workflow deployment status is the source of truth for whether a release is live.

For another static host, upload `dist/`. There is no backend and no rewrite configuration is required.

## Architecture

- `src/game/config/`: animal, product, building, economy, upgrade and level data.
- `src/game/engine/`: serializable deterministic farm simulation, seeded random movement, fixed-step clock, animal steering/state machine, bear interactions, objectives.
- `src/game/persistence/`: versioned and validated local saves, best times, incremental medal rewards, upgrade purchases.
- `src/scenes/`: Phaser loading and farm rendering; visual objects never own economic state.
- `src/ui/`: responsive HTML campaign map, shop, HUD, warehouse, dialogs, audio and app lifecycle.
- `src/assets/art.ts`: original vector illustrations and walking-frame generation.
- `scripts/balance.ts`: deterministic scenario policies and generated balance report.
- `tests/`: engine tests and Playwright campaign flows.

Progress saves locally every five seconds, on pause/navigation and when the page is hidden. Export/import JSON from Settings to move between devices or keep a backup. A hidden tab pauses the simulation; returning opens the pause menu. There is no offline income or catch-up farming. Restarting a day discards only that day's unfinished state.

See [GAME_DESIGN.md](GAME_DESIGN.md), [BALANCE.md](BALANCE.md), and [ASSET_GUIDE.md](ASSET_GUIDE.md). See [TESTING.md](TESTING.md) for actual verification results and scope.
