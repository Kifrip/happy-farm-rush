# Verification

Development verification is recorded here with its actual scope. Automated logic tests do not establish device performance or subjective game feel.

- `npm test`: 34 deterministic simulation/persistence tests passed during initial implementation.
- `npm run build`: strict TypeScript validation and Vite production build passed.
- Chromium smoke checks: farm renders, SVG textures load, timer advances, and no browser runtime errors were reported in both automatic WebGL and explicit Canvas runs.
- `npm run balance`: all 100 level/profile simulations completed with no purchased persistent upgrades after balancing changes. Detailed metrics are in `balance-results.json`.
- Playwright desktop and mobile campaign checks: in progress at the first playable release; final results will be added after they run.

## Scope and remaining limitations

Headless browser coverage is not a substitute for testing on physical Android devices. Art uses original vector walk frames and state transforms rather than large hand-painted sprite sheets. Ambient audio is a synthesized tone, not a composed musical soundtrack. Star upgrades deliberately let an experienced replay become faster than the initial campaign target. Balancing policies have perfect awareness of stock and goals even when their reactions are delayed, so the 45–60 minute target needs human playtesting.
