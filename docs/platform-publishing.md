# Publishing this game

The source repository is procrastinate-games/happy-farm-rush. GitHub Actions is the only production publisher. Cloudflare Workers Builds is disconnected.

Push main to run the shared [procrastinate-games/game-publisher](https://github.com/procrastinate-games/game-publisher) workflow (`@v1`): it runs the game's `npm test`, builds, validates public/game.json and smoke-tests the built dist/ directory. Check game.json locally with `npx --yes github:procrastinate-games/game-publisher#v1`. The same artifact is deployed to the existing pg-happy-farm-rush Worker. A successful live verification triggers the private procrastinate-games/pg-website portal to refresh its catalog.

Cloudflare and portal notification credentials come from organization Actions secrets. No per-game token setup is needed. New games start from procrastinate-games/game-template. Never put secrets in code or logs.

Player save keys and formats, the Worker name, and the workers.dev origin are preserved. Do not rename storage keys during platform maintenance. Read AGENTS.md before changing the game.
