# Original asset guide

## Art direction

A quiet storybook countryside: warm cream, sage pasture, terracotta roofs, timber details, soft ground shadows, expressive side-view animals and gentle outlines. The UI uses system Georgia/Trebuchet/Verdana rather than downloading fonts. Avoid emoji, extracted sprites or reference-game screenshots as game assets.

All shipped artwork is authored as SVG source in `src/assets/art.ts`. Buildings use separate three-level variants, with visible additions. Animal shapes have eyes, ears/beaks, limbs, wings/fleece/patches, tails and foot shadows; they are not geometric placeholders. Four generated walk frames change stride and bob; facing uses horizontal reflection. Eating nods, production popups, hungry tint/labels, flight speed and cage overlays communicate state. Products use distinct physical objects and colors, not just labels.

## Dimensions

| Asset | Source dimensions | Animation / use |
|---|---|---|
| Goose, sheep, cow, cat, dog, bear | 104 × 88 | Four original walk frames, facing, state transforms |
| Ten warehouse product sprites | 46 × 46 | Nine production goods plus caged bear icon |
| Six workshops | 150 × 135 | Three local upgrade variants, activity movement/progress/smoke |
| Well | 160 × 150 | Water bar and timed refill |
| Warehouse | 200 × 145 | Static building, animated collection destination |
| Delivery truck | 150 × 85 | Departure, absence and return along road |
| Grass | 70 × 54 | Growth scaling and food-dependent size |
| Cage overlay | 104 × 100 | Capture state |
| Farm background | 1000 × 650 | Hills, trees, flowers, stones, fences and road |
| Cloud | 180 × 60 | Slow simulated-time drift |

The loader creates base64 SVG data URLs; no runtime fetches to asset services are required. Phaser rasterizes once during loading. Texture variants are shared among entity sprites. Entity views are reused by ID and destroyed when no longer present. Expired labels are reused during a day. Decorative effects can be disabled and animation reduced independently.

## Audio

`src/ui/Audio.ts` synthesizes short pitch envelopes with Web Audio. Planting, refills, production, collection, workshop starts, truck trips, bear warnings, cage hits, purchases, errors and results have distinct pitches. An optional low-volume ambient tone has a separate slider. The audio context is created/resumed only after interaction; there are no samples, recordings or licensed music tracks.

## Ownership and licensing

Artwork and synthesis definitions were created for this repository; no assets were extracted from Farm Frenzy, Steam, MobyGames or Shockwave. Repository-authored code and artwork are covered by the included MIT license. Phaser and other dependencies retain their respective licenses; review their distributed notices when redistributing. Reference games and titles belong to their owners; inspiration does not imply endorsement.

## Extending assets

Keep feet and shadows near the same baseline so depth sorting remains accurate. Keep gameplay silhouettes inside the source bounds. New animals need four walk frames plus recognizable idle/eating/danger reactions. New products need a distinct silhouette at a 30-pixel display size. Place active pickup points toward the pasture. Any externally supplied replacement must include a documented license allowing distribution in the browser bundle.
