# Game design

Happy Farm Rush is an original real-time time-management game. It takes inspiration from the farm, workshop, transport and threat loop of the 2007 casual-game genre. It does not reproduce reference artwork, music, exact maps, levels or historical economic values.

## A farm day

The player plants grass using water, feeds autonomous animals, collects physical products, processes stored inputs, picks up workshop outputs, selects truck cargo and sells it at market. A day ends only when every explicit objective is satisfied. Menus and hidden tabs pause all farm time. Going beyond medal times does not end the day.

The level map contains 20 unlockable days in three chapters. Every day defines starting resources, animals, available workshops, allowed animal purchases, water, optional active upgrades, initial stock, bear schedules, medal thresholds and goals. The data schema accepts more levels without changing the simulator. Local machine upgrades reset between days; star upgrades persist.

## Autonomous friends

Every animal has an ID, position, target, hunger, cooldown, state and dog-bark cooldown. Geese, sheep and cows wander, seek nearby grass when hungry, eat it gradually and produce eggs, wool or milk while fed. Initial products arrive in 7–10 seconds. Production intervals differ by species. Productive animals flee nearby active bears. Soft pairwise separation prevents constant overlaps; positions are clamped to pasture bounds. Eating and walking use distinct poses and movement.

Hunger is a deficit: **0 = full**, increasing toward starvation. Above 70, a visible warning appears; at 87 production stops. At 190 an unfed animal leaves. Early food and generous grace allow recovery. Cats move to physically available products and collect only when storage has space. Dogs move toward bears and bark every 11 seconds, stunning them for 3.5 seconds. They do not capture bears or replace tapping.

## Production and storage

| Animal | Raw resource | Workshop 1 | Intermediate | Workshop 2 | Finished product |
|---|---|---|---|---|---|
| Goose | Egg | Egg powder mill | Egg powder | Little bakery | Cake |
| Sheep | Wool | Spinning mill | Thread | Weaving house | Cloth |
| Cow | Milk | Butter churn | Butter | Cheese cottage | Cheese |

Inputs leave the warehouse at the start of processing. A machine rejects new work while busy. Outputs spawn at workshop pickup points and must be collected, including by cats. Each workshop has three local levels, buying faster work and bigger batches with farm coins. Persistent speed/batch upgrades apply across workshops.

Products have independent positions and 65-second lifetimes. They blink during the last 14 seconds. Manual collection succeeds atomically only when the warehouse can accommodate the product's slot cost. The collected sprite flies toward the barn; a failed collection leaves it in place. Warehouse capacity starts at 16 slots; some logistics days explicitly constrain it. Nothing is silently discarded by capacity checks.

## Water and trade

Each planted patch costs one water and contains 28 food units. Refill costs coins and takes time; the well fills only when the refill ends. A water bar and HUD show availability and refill status.

The market panel lets the player increment/decrement quantities or fill available cargo slots. Its selection is a proposal, not a deduction. Dispatch validates quantities, stock, capacity and availability, then deducts the cargo. Coins, delivered-goal progress and cumulative revenue update exactly once when the trip ends. The truck cannot dispatch while traveling. A partial load is valid.

## Bears

Each level has a deterministic list of bear arrival times. Alternating sides and seeded positions make encounters repeatable. Bears announce themselves with a five-second warning before moving or attacking. Active bears pursue productive animals and destroy ground products they touch. Repeated taps slow/stun a bear and build its cage. A fully caged bear needs one more tap to enter storage, occupies five slots and can be sold. Uncollected cages break after 35 seconds; upgrades extend that duration. Escaped bears can be recaptured.

## Goals, medals and progression

Goal counters are separate: **collect** is cumulative successful pickups; **produce** is completed animal/workshop output; **deliver** is goods returned from market; **revenue** is cumulative sales; **balance** is current coins; **stock** is currently stored goods; **own** is current living animal count. HUD captions identify cumulative vs. currently owned goals. Collection is never inferred from inventory.

Gold/silver/bronze award three/two/one stars. The first finish awards its medal value. A better replay awards only the difference over the previous best medal. Best time and medal are retained independently. Completion clears the active save in the same campaign transaction, and replaying/restoring cannot award the same stars again.

Eight optional, three-tier star upgrades affect well capacity/refill efficiency, warehouse size, truck cargo/travel, cage efficiency/durability, factory speed/batch. There are no mandatory star purchases. Bronze completion always unlocks the next day.

## Recovery and accessibility

Neighbors' farm aid is available only when productive animals are entirely lost or the farm has no grass, water or money for a refill. It replenishes water and, if all productive animals are gone, supplies campaign-appropriate producers. Each use adds 30 seconds, preserving progress at the expense of a better medal. A restart remains available for a new strategy.

Touch works through taps; no routine action requires dragging. HTML menus use keyboard-accessible buttons. Escape/Space pauses. Settings offer sound and ambient volume, mute, reduced motion, extra-effects toggles, save export/import and confirmed progression reset. Phone landscape is preferred; portrait stacks goals above the farm and keeps the controls reachable by scrolling.

## Deliberate differences

Original watercolor-inspired vector colors, buildings, animals, branding and synthesized sounds; new level configurations and economic values; explicit cumulative/current objective captions; save export/import; no lives, failure deadline, offline economy, backend, advertisements, login or paid purchases. This release provides twenty authored days; forty-five days are an architectural extension rather than shipped content.
