# BigInt casting audit

This lists current BigInt conversion points and whether each conversion is strictly required on the normal code path.

## Direct casts to `BigInt`

| Location | Code | Necessary? | Notes |
| --- | --- | --- | --- |
| `shared/stats.js:5` | `BigInt(value ?? 0)` | **Partially** | Needed when input is string/number/nullish; redundant when input is already `BigInt`. |
| `api/data/models/fighters.js:57` | `BigInt(row.gold ?? 0)` | **Yes (defensive)** | DB reads can return strings/numbers; this normalizes read-time `gold` to `BigInt`. |
| `web/data/serverFighterState.js:39` | `BigInt(fighter?.gold ?? 0)` | **Yes (defensive)** | Websocket payload can contain stringified `gold`; this safely normalizes to `BigInt` with fallback to `0n`. |
| `web/pages/FighterSelect/index.js:86` | `BigInt(value).toFormattedNumber()` | **Usually no** | `value` is normally already `BigInt` after race normalization, so this is typically redundant; it still defends if non-`BigInt` leaks in. |
| `shared/bigInt.js:23` | `BigInt(digits === '0' ? 0 : digits.length)` | **Yes** | `digits.length` is a number; conversion is needed because `logApprox()` returns a `BigInt`. |

## Direct casts from `BigInt`

| Location | Code | Necessary? | Notes |
| --- | --- | --- | --- |
| `api/data/models/fighters.js:69` | `value.toString()` | **Yes** | Converts stat `BigInt`s to strings before DB write. |
| `api/logic/websocket-commands.js:49` | `(fighter[stat] ?? 0).toString()` | **Yes (for transport)** | Serializes starting stats for fight metadata. |
| `shared/bigInt.js:37` | `this.toString()` in `toJSON()` | **Yes** | Required because JSON cannot directly serialize `BigInt`. |
| `shared/bigInt.js:22,27` | `this.toString()` in formatting helpers | **Yes** | Used to inspect digit strings for formatting/log approximation. |

## Number casts that currently consume `BigInt` values

| Location | Code | Necessary? | Notes |
| --- | --- | --- | --- |
| `web/data/fightState.js:41` | `Number(fighter.gold)` | **Yes (for current math path)** | `Math.floor`/float multipliers require JS `number`; precision can degrade for very large values. |
| `web/data/fightState.js:60-61` | `Number(left.health)`, `Number(left.stamina)`, etc. | **Yes (for current fight simulation)** | Fight state math uses floating-point fields (`currentHealth`, `currentStamina`). |
| `web/data/fightState.js:78-79,105,108` | `Number(...stats...)` | **Yes (for current fight simulation)** | Runtime combat calculations are all number-based. |
| `api/data/seed-data/seeds/001-fighters.js:86` | `Number(value)` | **Yes (seed serialization)** | Converts shared race stat `BigInt`s to numeric seed payload values. |

## `parseBigIntStats` call sites (where the cast can be redundant)

`parseBigIntStats` does `BigInt(value ?? 0)` for each stat entry.

| Location | Input source | Necessary? |
| --- | --- | --- |
| `api/data/utils/stats.js:18` | DB row stats | **Yes** |
| `web/data/races.js:28` | API race payload stats | **Yes** |
| `web/data/serverFighterState.js:62` | Websocket fighter payload stats | **Yes** |
| `api/logic/fighter-actions.js:48` | `fighter.stats` from already-cast fighter model | **Usually redundant** |
| `api/logic/training.js:34` | `fighter.stats` from already-cast fighter model | **Usually redundant** |
| `api/logic/auth.js:55` | default stats + race stats (already `BigInt` in normal flow) | **Usually redundant** |
