# Shared

## Purpose

Pure JavaScript library shared by both `api/` and `web/` subprojects. Contains game constants, stat definitions, training logic, and data utilities. Has no external runtime dependencies.

## Modules

| File | Exports | Description |
|------|---------|-------------|
| `bigInt.js` | `patchBigIntPrototype` (default) | Patches `BigInt.prototype` with `toFormattedNumber` and `logApprox`. Import for side effect (`import 'shared/bigInt.js'`). |
| `moves.js` | `MOVE_DEFINITIONS`, `MOVE_IDS`, `MOVE_SEED_MOVES` | Move constants and seed data. |
| `races.js` | `RACES` | Playable race definitions with innate stats. |
| `seedData.js` | `createSeedEntries` | Utility for generating seed data arrays from definition/ID maps. |
| `skills/` | `SKILL_DEFINITIONS`, `SKILL_IDS`, `SKILL_SEED_ACTIONS`, `SKILLS_BY_ACTION_ID` | Skill constants and reverse lookup by action ID. |
| `stats.js` | `FIGHTER_STAT_KEYS`, `parseBigIntStats` | Stat key list and BigInt stat parser. |
| `training.js` | `applyTrainingAction`, `applyTrainingActions`, `createTrainingTimeline`, `findActiveTrainingAction`, `findTouchedAtTransfer`, `getMaxTouchedAtMs`, `getScheduledTrainingActions`, `getTrainingDurationMs` | Training application and scheduling logic. |
| `trainingStat.js` | `trainStat` (default), `getTrainingEffect` | Per-stat training calculation. |
| `trainingTimeline.js` | `createTrainingTimeline`, `findLatestAction`, `getActionTime`, `getScheduledActions` | Generic training timeline scheduling. |

## Developer commands

**After making shared changes, run `npm run lint` and `npm test` from the `shared/` directory to verify your work.**

| Task | Command |
|------|---------|
| Run tests | `npm test` |
| Run tests with coverage | `npm run test:coverage` |
| Lint (auto-fix) | `npm run lint` |
| Lint (read-only, CI) | `npm run lint:ci` |

## CI

GitHub Actions (`.github/workflows/shared.yml`) runs lint and tests with 95% coverage thresholds on PRs touching `shared/`.
