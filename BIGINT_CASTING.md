# BigInt casting audit

This lists the explicit places where the app converts values **to** or **from** JavaScript `BigInt`.

Scope notes:
- Included: `BigInt(...)`, `Number(...)`/`map(Number)` where the source can be a `BigInt`, and string conversion used for `BigInt` persistence/display.
- Excluded: unrelated `Number(...)` casts for route params, ports, websocket payloads, and PostgreSQL `int8` ID parsing, because those do not convert application values to or from JavaScript `BigInt`.

## To BigInt

| Location | Cast | Strictly necessary? | Notes |
| --- | --- | --- | --- |
| `shared/stats.js` | `BigInt(value ?? 0)` | **Usually yes** | This is the main normalization boundary for fighter stats coming from DB/API payloads. If a caller already passed `BigInt` values it is a no-op, but the helper exists specifically because many call sites are not already `BigInt`. |
| `api/logic/auth.js` | `parseBigIntStats({...DEFAULT_TRAINING_STATS, ...stats})` | **Yes** | New-player race stats come from the `races` table JSON payload as plain numbers, so they need normalization before the game uses `BigInt` comparisons and math. |
| `api/logic/fighter-actions.js` | `parseBigIntStats(fighter.stats || {})` | **Yes** | Skill requirement checks compare against `2500n`-style thresholds, so DB JSON stats must be normalized first. |
| `api/logic/training.js` | `parseBigIntStats({...fighter.stats})` | **Yes** | Training mutates persisted fighter stats, which come back from JSON/DB as non-`BigInt` values. |
| `web/data/serverFighterState.js` | `parseBigIntStats(fighter.stats)` | **Yes** | Websocket/API fighter payloads arrive as JSON-safe values, not store-ready `BigInt`s. |
| `shared/trainingStat.js` | `BigInt(stats[stat] ?? 0)` | **Not strictly, for current callers** | `trainStat()` currently receives stats objects that have already been normalized to `BigInt`, so this is mostly defensive. |
| `shared/trainingStat.js` | `BigInt(stats[multiplierStat] ?? 0)` | **Not strictly, for current callers** | Same as above: current callers already provide `BigInt` stats, but the helper tolerates mixed inputs. |
| `shared/trainingStat.js` | `BigInt(amount)` | **Yes** | Training amounts are passed as numbers. |
| `api/logic/training.js` | `BigInt(gold)` | **Yes** | `fighters.gold` is stored as `TEXT` in `api/data/tables/fighters.sql`, so arithmetic requires a cast first. |
| `api/logic/training.js` | `BigInt(amount)` | **Yes** | Win rewards are numeric action amounts, not `BigInt`s. |
| `web/data/serverFighterState.js` | `BigInt(fighter?.gold ?? 0)` | **Yes** | Server gold is a JSON-safe value and the web store keeps gold as `BigInt`. |
| `web/data/fighter.js` | `BigInt(gold)` in `spend()` | **Yes** | Callers pass numeric prices/bets, while store gold is `BigInt`. |
| `web/data/fighter.js` | `BigInt(gold)` in `win()` | **Yes** | Same reason as `spend()`. |
| `web/data/inventory.js` | `BigInt(item.cost * COST_MULTIPLIER)` | **Yes** | Item costs are plain numbers. |
| `web/pages/GameLayout/Shop/index.js` | `BigInt(Items[itemKey].cost)` | **Yes** | Shop item costs are defined as numbers in `Items.js`. |
| `web/pages/GameLayout/Fight/index.js` | `BigInt(...)` around enemy/current health and combat stats | **Yes** | Fight simulation state is number-based, but `toFormattedNumber()` only exists on `BigInt`. |
| `web/pages/GameLayout/Hub/Stats.js` | `BigInt(getStatValue(...))` | **Mixed** | Necessary for derived combat stats because they are numbers. Redundant for `gold` and already-normalized training/base stats because those are already `BigInt`. |
| `web/pages/FighterSelect/index.js` | `BigInt(value)` | **No, not currently** | Race base stats come from `shared/races.js` and are already `BigInt`s, so this cast is redundant today. |
| `shared/bigInt.js` | `BigInt(digits === '0' ? 0 : digits.length)` | **Yes** | `logApprox()` returns a `BigInt`, but `digits.length` is a number. |

## From BigInt

| Location | Cast | Strictly necessary? | Notes |
| --- | --- | --- | --- |
| `api/data/seed-data/seeds/001-fighters.js` | `Number(value)` | **Yes** | Shared race stats are authored as `BigInt`s, but seed JSON for the `races.stats` JSONB column must be plain JSON-safe numbers here. |
| `web/data/fighterState.js` | `[...].map(Number)` | **Yes** | Combat calculations use `Math.log()`/`Math.sqrt()` and intentionally keep fight stats as numbers. |
| `web/data/fightState.js` | `Number(fighter.gold)` | **Yes** | Betting multiplies gold by fractional risk percentages, which requires number math. |
| `api/logic/training.js` | `(BigInt(gold) + BigInt(amount)).toString()` | **Yes** | Gold is persisted back into the `fighters.gold` text column as a string. |
| `shared/bigInt.js` | `this.toString()` in `toJSON()` | **Yes** | JSON does not support raw `BigInt` values. |
| `shared/bigInt.js` | `this.toString()` in `toFormattedNumber()` | **Yes** | Formatting works from the decimal string representation. |
| `shared/bigInt.js` | `(-this).toString()` / `this.toString()` in `logApprox()` | **Yes** | The helper counts digits from the string form. |
| `web/pages/GameLayout/GoldDisplay.js` | `String(cents)` | **Yes** | This is display-only formatting for a `BigInt` remainder. |

## Current cleanup opportunities

- `web/pages/FighterSelect/index.js` has a clearly redundant `BigInt(value)` cast because race stats are already `BigInt`.
- `shared/trainingStat.js` defensively re-wraps stat values that are already normalized to `BigInt` at current call sites.
- `web/pages/GameLayout/Hub/Stats.js` uses one `BigInt(...)` wrapper for both number-backed combat stats and already-`BigInt` stats, so only part of that cast is truly needed.
