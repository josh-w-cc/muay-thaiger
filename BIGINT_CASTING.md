# BigInt Casting Audit

This lists every production-code cast to/from `BigInt` and whether it is necessary.

| Location | Cast | Necessary? | Why |
|---|---|---|---|
| `shared/stats.js:3` | `BigInt(value ?? 0)` | Yes | Normalizes mixed incoming stat values (`string`, `number`, `null`/`undefined`) into `BigInt` for shared stat math. If the input is already `BigInt`, this is effectively a no-op normalization. |
| `shared/training.js:4` | `typeof stat === 'bigint' ? stat : BigInt(stat ?? 0)` | Yes | Guard avoids re-casting when already `BigInt`; cast is only used for non-`BigInt` input. |
| `shared/training.js:5` | `BigInt(elapsedPeriods)` | Yes | Training math is done with `BigInt`; `elapsedPeriods` is numeric input and must be converted before multiplication/division with `BigInt`. |
| `shared/bigInt.js:23` | `BigInt(digits === '0' ? 0 : digits.length)` | Yes | `logApprox` is defined to return `BigInt`; `digits.length` is a `number` and must be converted. |
| `web/utils/formatHugeNumber.js:7` | `typeof value === 'bigint' ? value : BigInt(value)` | Yes | Supports both `bigint` and non-`bigint` callers while preserving precision for huge values. Existing `bigint` input is passed through unchanged. |
| `api/logic/training.js:40` | `BigInt(fighter.gold ?? 0) + BigInt(trainActions.length)` | Yes | `fighter.gold` may be string/number and `trainActions.length` is a number. Both must be converted for safe `BigInt` arithmetic. |
| `api/data/models/fighters.js:36` | `` `${value}` `` (to string) | Yes | Writes stats as strings so DB JSON payloads remain serializable and avoid `BigInt` JSON serialization issues. |
| `api/logic/training.js:43` | `` `${nextGold}` `` (to string) | Yes | Persists computed `BigInt` gold as a string for storage/serialization compatibility. |
| `shared/bigInt.js:22` | `this.toString()` / `(-this).toString()` | Yes | Converts `BigInt` to digits string for digit counting in `logApprox`. |
| `shared/bigInt.js:27` | `this.toString()` | Yes | Converts `BigInt` to digits string for scientific-notation formatting. |
| `shared/bigInt.js:37` | `this.toString()` | Yes | `toJSON` must return a JSON-safe string because raw `BigInt` is not JSON-serializable. |

## Summary

- All production casts found are intentional and necessary for one of:
  - mixed-type input normalization,
  - required `BigInt` arithmetic,
  - or JSON/storage-safe string serialization.
- The only places already guarding against unnecessary re-cast of existing `BigInt` values are:
  - `shared/training.js:4`
  - `web/utils/formatHugeNumber.js:7`
