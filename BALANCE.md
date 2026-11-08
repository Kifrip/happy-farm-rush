# Original balance configuration

All prices, intervals and targets below are new design choices, not verified values from the reference game. The authoritative settings are in `src/game/config/`. All production steps consume one input per output; batch size affects throughput, not conversion ratio.

## Animals and products

| Animal | Price | Speed (world units/s) | Production interval | Hunger/s |
|---|---:|---:|---:|---:|
| Goose | 90 | 36 | 30s | 1.35 |
| Sheep | 260 | 28 | 42s | 1.20 |
| Cow | 540 | 23 | 50s | 1.55 |
| Cat | 180 | 68 | Collects products | 0 |
| Dog | 210 | 55 | 11s bark cooldown | 0 |

Initial producer cooldowns are seeded 7–10 seconds, giving a quick first harvest. Later output follows full species intervals. Hunger is a deficit (increases while hungry), not remaining satiation. Food lowers the deficit at 17 units/s and consumes grass at 13 units/s. A patch has 28 food units.

| Product | Sale price | Storage/cargo slots |
|---|---:|---:|
| Egg | 18 | 1 |
| Egg powder | 48 | 1 |
| Cake | 108 | 2 |
| Wool | 38 | 2 |
| Thread | 86 | 2 |
| Cloth | 175 | 3 |
| Milk | 62 | 2 |
| Butter | 138 | 2 |
| Cheese | 270 | 3 |
| Caged bear | 90 | 5 |

Every manufactured product is worth more than its input. Raw selling remains useful to fund water or purchases while workshops are busy. Products expire after 65 seconds, with 14 seconds of warning.

## Workshops and logistics

| Workshop | Time at local level 1 | Local upgrade base cost |
|---|---:|---:|
| Egg powder mill | 18s | 110 |
| Bakery | 24s | 170 |
| Spinning mill | 21s | 150 |
| Weaving house | 27s | 210 |
| Butter churn | 23s | 190 |
| Cheese cottage | 29s | 250 |

Local upgrades cost base × current level, up to level 3. Time is `base × (1 − 0.15 × persistentSpeed) / (1 + 0.2 × (localLevel − 1))`. Batch capacity is local level + persistent batch tier. Only available inputs are consumed.

Base water capacity: 12. A refill costs 12 coins and takes 4s. Base warehouse: 16 slots; days 14 and 19 start at 14 and 18 respectively. Truck: 12 slots, 15s round trip. Bears: 5s warning, 27 units/s, 3 capture taps plus collection, 35s cage durability. Their schedules are authored per day rather than a surprise global spawn timer.

| Permanent upgrade | Tier star costs | Improvement per tier |
|---|---|---|
| Well | 2 / 4 / 7 | +5 water |
| Refill | 2 / 4 / 7 | −0.7s and −2 coins |
| Warehouse | 3 / 5 / 8 | +8 slots |
| Cargo | 2 / 4 / 7 | +6 slots |
| Truck | 3 / 5 / 8 | −2.5s trip |
| Cage | 3 / 5 / 8 | Fewer capture clicks at tiers 1/3, +12s durability each tier |
| Factory speed | 3 / 6 / 9 | −15% base time |
| Factory batch | 4 / 7 / 10 | +1 batch |

Bronze/silver/gold pay 1/2/3 total stars per day. Only improvements over a previous medal pay more. Sixty campaign stars cannot buy everything; choices matter, but none is mandatory. Farm aid costs 30 seconds rather than stars or coins and only works when stranded.

## Deterministic campaign experiments

`npm run balance` writes a fresh `balance-results.json` containing one run of every day for each policy. It uses the real fixed-step engine, no persistent upgrades, a fixed level seed, 50ms simulation steps and an upper bound of 900 simulated seconds per day. No renderer or frame-rate assumptions enter the economy.

Policies:

1. Beginner: reacts every 4s, maintains food, collects and sends shipments, processes chains in order.
2. Average: same rules with a 1.3s reaction interval.
3. Efficient: 0.4s reaction interval, keeps minimal required input reserves.
4. Storage shortage: 2s reactions, deliberately holds larger raw reserves and waits for fuller cargo, then frees capacity and honors outstanding deliveries.
5. Bear loss: introduces a close bear encounter and replaces a lost producer using the available farm economy; levels without bears remain the normal policy.

These policies perform multiple decisions at a reaction point and know objective dependencies. They are economic solvability experiments, not claims of measured human play time. They do not exhaust all decisions or prove every medal is achievable with every upgrade selection.

The initial campaign took only 27–34 minutes in these experiments. Producer intervals, workshop times, animal mixes and advanced orders were revised. Current no-upgrade runs are roughly 44–47 minutes across the policies, before menus and upgrade decisions. All 100 scenarios complete after the storage policy was corrected to free raw reserves when full. See the JSON for exact per-level times, losses, refused collections, farm-aid usage and goal progress.

Days 1–6 target about 1–3 minutes, days 7–16 about 2–4 minutes, and days 17–20 about 3–6 minutes; individual learning days can be shorter. The twenty configurations have distinct starting flocks, workshops, goals and arrival schedules. More demanding gold optimization and human pacing still benefit from playtesting.
