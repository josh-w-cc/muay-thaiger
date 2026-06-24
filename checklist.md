# CSS Module Parent-Import Audit

Checked every component file in `web/` for the bad pattern: a child component importing a parent component's CSS module (particularly where the parent doesn't use the rule the child needs).

## Files Checked

### `web/components/`
- [x] `components/Button.js` → imports `./Button.module.css` ✓
- [x] `components/primitive/Section.js` → imports `./Section.module.css` ✓

### `web/pages/FighterSelect/`
- [x] `FighterSelect/index.js` → imports `./FighterSelect.module.css` ✓

### `web/pages/GameLayout/`
- [x] `GameLayout/index.js` → imports `./GameLayout.module.css` ✓
- [x] `GameLayout/Header.js` → imports `./Header.module.css` ✓
- [x] `GameLayout/NavHeader.js` → imports `./NavHeader.module.css` ✓
- [x] `GameLayout/GoldDisplay.js` → imports `./GoldDisplay.module.css` ✓
- [x] `GameLayout/UserMenuButton.js` → imports `./UserMenuButton.module.css` ✓

### `web/pages/GameLayout/Hub/`
- [x] `Hub/index.js` → imports `./Hub.module.css` ✓
- [x] `Hub/FighterDetails.js` → imports `./FighterDetails.module.css` ✓
- [x] `Hub/Leaderboard/index.js` → imports `./Leaderboard.module.css` ✓

### `web/pages/GameLayout/Train/`
- [x] `Train/index.js` → no CSS module (no styles needed) ✓
- [x] `Train/Stats.js` → imports `./Stats.module.css` ✓
- [x] `Train/TrainStat.js` → imports shared primitive `stat-display-base.module.css` directly ✓

### `web/pages/GameLayout/Train/Regimen/`
- [x] `Regimen/index.js` → imports `./Regimen.module.css` ✓
- [x] `Regimen/RegimenRow.js` → imports `./RegimenRow.module.css` ✓
- [x] `Regimen/RegimenName.js` → imports `./RegimenName.module.css` ✓
- [x] `Regimen/RegimenProgress.js` → imports `./RegimenProgress.module.css` ✓
- [x] `Regimen/RegimenActionButton.js` → imports `./RegimenActionButton.module.css` ✓
- [x] `Regimen/SkillInfoButton.js` → imports `./SkillInfoButton.module.css` ✓

### `web/pages/GameLayout/Fight/`
- [x] `Fight/index.js` → imports `./Fight.module.css` ✓
- [x] `Fight/ZerothFight.js` → imports `./ZerothFight.module.css` ✓
- [x] `Fight/FightForGlory/index.js` → imports `./FightForGlory.module.css` ✓
- [x] `Fight/ActiveFight/index.js` → no CSS module (no styles needed) ✓
- [x] `Fight/ActiveFight/FightFeed.js` → imports `./FightFeed.module.css` ✓
- [x] `Fight/ActiveFight/FightFighters.js` → imports `./FightFighters.module.css` ✓
- [x] `Fight/ActiveFight/FightLoadout.js` → imports `./FightLoadout.module.css` ✓

## Result

No instances found. Every component either:
- imports its own co-located CSS module, or
- imports a shared base module from `components/primitive/css-modules/` (the sanctioned shared-primitive pattern), or
- needs no CSS module.
