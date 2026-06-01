# BigInt Casting Audit

This lists every current cast to/from `BigInt` in the codebase and whether it is strictly necessary.

## Casts **to** BigInt

| Location | Cast | Strictly necessary? | Notes |
| --- | --- | --- | --- |
| `shared/stats.js` (`parseBigIntStats`) | `BigInt(value ?? 0)` | **Partially** | Necessary when input is string/number/null from DB or wire payloads. If input is already `BigInt`, this is redundant but harmless (`BigInt(7n) === 7n`). |
| `api/data/models/fighters.js` (`castFighterGold`) | `BigInt(row.gold ?? 0)` | **Partially** | Necessary to normalize DB-read `gold` values (commonly string/number/null) to `BigInt`. Redundant if DB client already returns `BigInt`. |
| `web/data/serverFighterState.js` (`getServerGold`) | `BigInt(fighter?.gold ?? 0)` | **Partially** | Necessary to normalize server payloads (usually string/number) and guarded with `try/catch`. Redundant when payload is already `BigInt`. |
| `shared/bigInt.js` (`logApprox`) | `BigInt(digits === '0' ? 0 : digits.length)` | **Yes** | Function intentionally returns a `BigInt` digit count (`0n`, `1n`, etc.), matching its tests and prototype API contract. |

### Indirect BigInt casts (through `parseBigIntStats`)

- `api/data/utils/stats.js` (`castStats`)
- `web/data/races.js` (`normalizeRaces`)
- `web/data/serverFighterState.js` (`getServerStats`)

All three use `parseBigIntStats`, so the same “partially necessary” rule above applies.

## Casts **from** BigInt

| Location | Cast | Strictly necessary? | Notes |
| --- | --- | --- | --- |
| `shared/bigInt.js` (`toJSON`) | `this.toString()` | **Yes** | `JSON.stringify` cannot serialize raw `BigInt`; string conversion is required for JSON payloads. |
| `api/data/models/fighters.js` (`serializeFighterStats`) | `value.toString()` | **Yes** | Converts stat values to string before persistence/serialization of stats payloads. Prevents BigInt JSON/DB serialization issues. |
| `api/logic/websocket-commands.js` (`captureStartingStats`) | `(fighter[stat] ?? 0).toString()` | **Yes** | Ensures fight snapshot values are JSON-safe strings and consistent regardless of numeric source type. |
| `web/data/fightState.js` | `Number(fighter.gold)`, `Number(left.health)`, `Number(left.stamina)`, `Number(right.health)`, `Number(right.stamina)`, `Number(nextFighters[*].stats.apm)`, `Number(you.stats.attack)`, `Number(them.stats.defense)`, `Number(you.stats.power)` | **Yes (for current combat math)** | Needed because this fight simulation uses `Math.*` and floating-point operations that require `Number`. Tradeoff: potential precision loss for very large values. |
