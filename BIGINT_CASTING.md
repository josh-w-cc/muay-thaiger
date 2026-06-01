# BigInt casting audit

This document lists all current explicit casts to/from `BigInt` in runtime code and whether each cast is strictly necessary.

## Direct casts

| Location | Cast | Direction | Strictly necessary? | Notes |
|---|---|---|---|---|
| `shared/stats.js:5` | `BigInt(value ?? 0)` | mixed -> `BigInt` | **Partially** | Required for string/number/null inputs; redundant when `value` is already `BigInt`. |
| `shared/bigInt.js:23` | `BigInt(digits === '0' ? 0 : digits.length)` | `number` -> `BigInt` | **Yes** | `logApprox()` returns a `BigInt`; `digits.length` is a `number`. |
| `api/data/models/fighters.js:57` | `BigInt(row.gold ?? 0)` | DB value -> `BigInt` | **Yes** | Normalizes DB-read gold into `BigInt` for app math. |
| `web/data/serverFighterState.js:39` | `BigInt(fighter?.gold ?? 0)` | server payload -> `BigInt` | **Yes** | Websocket/API payload gold is serialized, so client must restore `BigInt`. |
| `api/data/seed-data/seeds/001-fighters.js:86` | `Number(value)` | `BigInt` -> `number` | **Yes** | Race seed stats originate as `BigInt` in `shared/races.js`; JSON/DB seed rows need non-`BigInt` values. |
| `web/data/fightState.js:41` | `Number(fighter.gold)` | `BigInt` -> `number` | **Yes** | Fight betting logic uses floating-point percentage math. |
| `web/data/fightState.js:60-61` | `Number(left.health)`, `Number(left.stamina)`, `Number(right.health)`, `Number(right.stamina)` | `BigInt` -> `number` | **Yes** | Fight simulation state uses mutable floating-point values. |
| `web/data/fightState.js:78-79` | `Number(nextFighters[fighterIndex].stats.apm)` | `BigInt` -> `number` | **Yes** | Per-tick APM accumulation is fractional. |
| `web/data/fightState.js:105` | `Number(you.stats.attack)`, `Number(them.stats.defense)` | `BigInt` -> `number` | **Yes** | Randomized hit chance compares floating-point products. |
| `web/data/fightState.js:108` | `Number(you.stats.power)` | `BigInt` -> `number` | **Yes** | Damage roll multiplies by random float. |

## BigInt -> string conversions

| Location | Cast | Strictly necessary? | Notes |
|---|---|---|---|
| `shared/bigInt.js:22,27` | `this.toString()` | **Yes** | Converts `BigInt` to digits for display/length logic. |
| `shared/bigInt.js:37` | `this.toString()` (`toJSON`) | **Yes** | Required because `JSON.stringify` cannot serialize raw `BigInt`. |
| `api/data/models/fighters.js:69` | `value.toString()` | **Partially** | Required when stats values are `BigInt`; redundant if already string/number. |
| `api/logic/websocket-commands.js:49` | `(fighter[stat] ?? 0).toString()` | **Yes** | Serializes numeric values to strings for JSON-safe fight snapshot payloads. |

## Indirect cast entry points (via `parseBigIntStats`)

`parseBigIntStats` performs the cast in `shared/stats.js:5` and is used at:

- `api/data/utils/stats.js:18` (API model row stats normalization)
- `web/data/serverFighterState.js:62` (client fighter overwrite payload normalization)
- `web/data/races.js:28` (client race stats normalization)
