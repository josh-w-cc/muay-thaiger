# Muay Thaiger — Game Design Document

## 1. Vision

Muay Thaiger is a PvP incremental fighting game set in a mythologised Southeast Asian world of jungle monasteries, ghost-haunted forests, and sacred tattoos. Players raise an anthropomorphic animal fighter from a raw beginner to a legendary champion — training, fighting, accumulating wealth and reputation, earning a martial style from one of the 108 Ruesi sages, and eventually watching their fighter age into memory before a new generation inherits their ancestor's power.

The tone is humid, feverish, and spiritual. Think monsoon rain on temple rooftops, incense smoke mixing with blood and tiger balm, and a master who elbows you unconscious before apologising to the ring spirit.

---

## 2. Core Loop

```
Start (no sign-up) → Train → Fight → Earn $ → Unlock Shop / Sensei / Ranks → Age Out → Ancestor Points → New Fighter
```

1. **Slow start.** The new player's first experience ("ZerothFight") removes most options to avoid overwhelm. The fighter has limited training choices and one poor way to earn money.
2. **Fight to grow.** Fights earn money and wins. Money buys equipment. Wins (plus money) unlock the Sensei. The Sensei grants a Style.
3. **Style deepens everything.** A Style unlocks additional training options and unique combat moves, shifting the game from pure clicker toward a richer idle/strategic build.
4. **Rank up.** Enough wins unlock Ranked Tournaments. The fighter who holds the most tournament victories holds the Belt.
5. **Age out.** Characters eventually age out of peak performance and retire. On retirement/death the player receives Ancestor Points to invest in the next fighter, creating inter-generational progression.

---

## 3. Players & Characters

### Players

A Player account is created automatically on first visit — no sign-up required. A Player can own one active Fighter at a time.

### Characters (Fighters)

| Attribute | Notes |
|-----------|-------|
| Race | Anthropomorphic animal species; provides innate stat bonuses |
| Style | Martial art tradition; unlocked via Sensei |
| Stats | Vigor (strength), Agility, Constitution, Stamina, Skill |
| Moves | Combat actions available in fight |
| Age | Increases over time; high age triggers retirement |

**Fighter lifecycle:** Created → Active → Aged Out / Dead → Ancestor

---

## 4. Races

Races are anthropomorphic animal species. Each race provides innate stat modifiers (analogous to IV/genetic values) and unique lore.

| Race | Animal | Flavour |
|------|--------|---------|
| Tiger | Tiger | Maotong — explosive aggression, predatory timing |
| Snow Leopard | Snow Leopard | Mingtian — evasion, high-altitude endurance |
| (more to come) | | |

Race affects:
- Base stat distribution
- Death/retirement flavour
- Possible move availability
- Training effectiveness multipliers

---

## 5. Styles & the 108 Ruesi

### Unlocking a Style

A fighter unlocks the Sensei system once they have accumulated a threshold of both wins and money. The Sensei is drawn from **The 108 Ruesi** — a pantheon of hermit sages each associated with a distinct fighting philosophy.

### Style Axes

Styles sit on two axes:

| Axis | Pole A | Pole B |
|------|--------|--------|
| Engagement | Aggressive (Clicker) | Strategic (Idler) |

### Named Styles

| Style | Flavour |
|-------|---------|
| Feline Fury | Explosive aggression, combo chains |
| One Mind | Total tactical composure, reads opponents |
| Breathing / Stamina | Outlasts opponents; recovers faster |
| Hundred Handed | Relentless volume striking |
| Stance Dance | Footwork and positional dominance |
| Slippery Skin | Evasion and deflection |
| Pressure | Forward force, clinch, smothering offence |

Each Style:
- Unlocks unique combat Moves
- Modifies training option availability and effectiveness
- Influences idle behaviour

---

## 6. Training System

### Overview

Training is the primary incremental loop between fights. The player selects training activities that run over time, improving fighter stats (EV-style trained values separate from innate Race values).

Training can be:
- **Tapped** to accelerate (active play)
- **Idled** as a passive background loop

### Training Types

Training maps to the five core mastery pillars:

| Pillar | Stat(s) Improved | Example Methods |
|--------|-----------------|-----------------|
| **Pain** | Vigor (strength) | Iron Palm, Iron Shirt, Shin Conditioning, Endurance Beatings |
| **Balance** | Agility | Pole Standing, Plum Blossom Steps, Qinggong drills |
| **Breath** | Stamina / Constitution | Waterfall Meditation, Embryonic Breathing, Sanchin |
| **Stillness** | Skill | Zhan Zhuang, Cave Meditation, Listening Energy |
| **Fear** | All (slow) | Cremation Ground Vigil, Spirit House Trial, Graveyard Vigil |

### Training Method List (excerpt — 150+ total)

A curated selection from the full list of 150 training challenges. Each method has a name, pillar, flavour description, and stat weights.

<details>
<summary>Training Methods 1–50</summary>

1. Meditate beneath an icy waterfall until the body stops shivering *(Breath)*
2. Carry buckets of water up a thousand temple steps every dawn *(Pain)*
3. Balance barefoot on swaying bamboo poles during a windstorm *(Balance)*
4. Punch a hanging iron bell until the knuckles stop bleeding *(Pain)*
5. Sleep hanging upside down from tree branches *(Stillness)*
6. Walk across hot river stones fresh from volcanic springs *(Fear)*
7. Hold horse stance while monks stack stones on the shoulders *(Pain)*
8. Sprint across rooftops without disturbing loose tiles *(Balance)*
9. Climb sheer cliffs using only fingertips and toes *(Pain)*
10. Practice sword forms while standing in waist-deep snow *(Breath)*
11. Run through forests blindfolded, guided only by sound *(Stillness)*
12. Catch flies or falling leaves with chopsticks *(Skill)*
13. Sit motionless in a cave for seven days *(Stillness)*
14. Swim across underground rivers while holding a lantern above water *(Breath)*
15. Strike trees until bark splinters apart *(Pain)*
16. Leap between moving boats without splashing water *(Balance)*
17. Perform katas while balancing bowls of oil on the head *(Balance)*
18. Drag massive stone blocks across desert sands *(Pain)*
19. Hang from ceilings by the knees for hours *(Pain)*
20. Spar atop narrow bridge rails over deep chasms *(Fear)*
21. Train breathing by meditating buried beneath sand *(Breath)*
22. Endure lightning storms atop mountain peaks *(Fear)*
23. Carry an elderly master across dangerous terrain without stumbling *(Pain)*
24. Walk silently across floors covered in shattered glass *(Balance)*
25. Balance on one finger atop a spear shaft *(Balance)*
26. Strike candles hard enough to extinguish flames without touching them *(Skill)*
27. Run uphill wearing iron weights chained to the limbs *(Pain)*
28. Catch arrows fired from hidden directions *(Stillness)*
29. Practice footwork on floating logs in a river *(Balance)*
30. Break icicles with open palms *(Pain)*
31. Stand beneath avalanches to resist fear and force *(Fear)*
32. Meditate while surrounded by swarming insects *(Stillness)*
33. Climb pagodas using only exterior beams *(Pain)*
34. Train reactions by dodging swinging logs and pendulums *(Balance)*
35. Fast for weeks while maintaining daily combat practice *(Breath)*
36. Sleep sitting upright on narrow posts *(Stillness)*
37. Split rain droplets with a blade *(Skill)*
38. Carry giant temple bells on the back during pilgrimages *(Pain)*
39. Perform backflips while balancing tea cups *(Balance)*
40. Fight blindfolded against multiple attackers *(Fear)*
41. Hold burning coals in the hands without flinching *(Fear)*
42. Dive into freezing lakes at sunrise every day *(Breath)*
43. Run across treetops without breaking branches *(Balance)*
44. Balance upside down from a spear tip *(Balance)*
45. Meditate inside roaring waterfalls to sharpen focus *(Breath)*
46. Strike sandbags filled with gravel and iron pellets *(Pain)*
47. Push boulders uphill using only shoulder pressure *(Pain)*
48. Jump repeatedly across narrow canyon gaps *(Balance)*
49. Write calligraphy while holding deep stances *(Stillness)*
50. Balance bowls of water on outstretched limbs during forms *(Balance)*

</details>

<details>
<summary>Training Methods 51–108</summary>

51. Catch fish barehanded in rushing streams *(Skill)*
52. Walk for miles wearing shoes carved from stone *(Pain)*
53. Perform forms while surrounded by spinning blades *(Fear)*
54. Climb ropes coated in oil *(Pain)*
55. Train underwater to slow the heartbeat *(Breath)*
56. Hold heavy statues overhead while reciting mantras *(Pain)*
57. Spar in total darkness inside caves *(Fear)*
58. Traverse entire forests without leaving footprints *(Balance)*
59. Sit inside circles of fire to master fear *(Fear)*
60. Practice strikes against hanging chains *(Pain)*
61. Cross rivers by hopping between floating debris *(Balance)*
62. Carry giant logs through deep snow *(Pain)*
63. Run beside galloping horses for miles *(Breath)*
64. Learn balance by standing atop drifting rafts during storms *(Balance)*
65. Practice forms against crashing ocean waves *(Breath)*
66. Walk along sword blades laid edge-up *(Balance)*
67. Train precision by slicing falling petals in half *(Skill)*
68. Spend nights meditating in graveyards *(Fear)*
69. Push fingers into jars of hot sand *(Pain)*
70. Endure hours beneath waterfalls carrying stone slabs *(Pain)*
71. Leap over rows of spears planted in the earth *(Balance)*
72. Climb mountains carrying another student on the back *(Pain)*
73. Practice breathing while suspended underwater by chains *(Breath)*
74. Balance on rolling barrels while sparring *(Balance)*
75. Walk across rice paper without tearing it *(Balance)*
76. Train awareness by listening for heartbeats in silence *(Stillness)*
77. Strike iron cauldrons until the sound changes tone *(Pain)*
78. Swing from tree branches across ravines *(Balance)*
79. Carry lit incense sticks while performing acrobatics without extinguishing them *(Skill)*
80. Hold impossible poses atop swaying poles *(Balance)*
81. Wrestle wild animals as a rite of passage *(Pain)*
82. Walk barefoot through thorn fields *(Fear)*
83. Train endurance by chasing waterfalls upstream *(Breath)*
84. Catch pebbles fired from slings at close range *(Stillness)*
85. Perform aerial spins over pits of spikes *(Fear)*
86. Sit beneath freezing moonlight without clothing *(Breath)*
87. Practice stillness while birds perch on the body *(Stillness)*
88. Run through bamboo forests while avoiding snapping stalks *(Balance)*
89. Break falling stones before they hit the ground *(Skill)*
90. Spar while standing atop floating barrels in water *(Balance)*
91. Scale fortress walls with bare hands *(Pain)*
92. Train kicks by striking hanging temple drums *(Pain)*
93. Balance a lit candle on the foot during handstands *(Balance)*
94. Hold stances while waterfalls erode the ground beneath them *(Breath)*
95. Practice movement while shackled in chains *(Pain)*
96. Run across sand dunes carrying heavy urns *(Pain)*
97. Perform forms while monks throw rocks to disrupt concentration *(Stillness)*
98. Meditate under the midday desert sun without water *(Fear)*
99. Strike pressure points on hanging dummies carved from hardwood *(Skill)*
100. Spend a year wandering mountains carrying nothing but a staff and robes *(Stillness)*
101. Stand beneath a collapsing waterfall while reciting sutras without losing breath *(Breath)*
102. Carry lit braziers through high winds without spilling ash *(Skill)*
103. Climb giant statues using only two fingers per hand *(Pain)*
104. Practice forms on frozen lakes without cracking the ice *(Balance)*
105. Walk through dense forests while avoiding every hanging bell trap *(Stillness)*
106. Spar against opponents while waist-deep in mud *(Pain)*
107. Balance atop spinning mill wheels over rivers *(Balance)*
108. Sleep inside a circle of hanging blades *(Fear)*

</details>

### Training Categories (Named Systems)

#### Iron Body / Conditioning
- **Iron Shirt (Tie Bu Shan)** — torso conditioning through breathing and impact drills
- **Iron Palm (Tie Sha Zhang)** — hand hardening against sand, gravel, iron shot
- **Iron Fingers / Eagle Claw** — finger strength through jar thrusts and gripping
- **Golden Bell Cover (Jin Zhong Zhao)** — legendary full-body invulnerability conditioning
- **Iron Head Training** — headbutt conditioning
- **Cotton Body** — soft absorption, yielding rather than resisting
- **Stone Warrior Training** — load-carrying endurance

#### Stance & Endurance
- **Horse Stance (Ma Bu)** — deep static stance torture
- **Golden Rooster** — one-legged balance
- **Pole Standing / Plum Blossom Poles** — elevated balance and footwork
- **Zhan Zhuang ("Standing Like a Tree")** — motionless standing meditation
- **Wall Sitting** — static endurance

#### Sensory / Awareness
- **Listening Energy (Ting Jin)** — tactile sensitivity
- **Blindfold Training** — awareness development
- **Sticky Hands (Chi Sao)** — sensitivity reflex training
- **Push Hands (Tui Shou)** — balance and tactile drills
- **Catching Pebbles / Flies** — reflex and dexterity

#### Acrobatics / Mobility
- **Qinggong / Lightness Skill** — rooftop running, wall-running, water-skimming
- **Plum Blossom Steps** — precise footwork patterns
- **Drunken Steps** — off-balance deceptive movement
- **Monkey Training** — climbing, swinging, awkward locomotion

#### Ascetic / Spiritual
- **Waterfall Meditation** — Buddhist/Shugendo cold austerity
- **Mountain Pilgrimage** — endurance asceticism
- **Cave Meditation** — isolation and deprivation
- **Fire Walking** — fear and pain mastery
- **Winter Training (Kanchu Keiko)** — freezing-conditions practice

#### Internal Power / Qi
- **Small Heavenly Circulation** — microcosmic orbit breathing
- **Big Heavenly Circulation** — whole-body qi circulation
- **Embryonic Breathing** — Daoist longevity cultivation
- **Bone Marrow Cleansing (Xi Sui Jing)** — Shaolin internal transformation
- **Muscle-Tendon Changing Classic (Yi Jin Jing)** — Shaolin conditioning system
- **Dantian Forging** — core internal energy
- **Silk Reeling Energy (Chan Si Jin)** — spiral force training

### Bag Training & Walk on Coals

Two signature early-game training options available before a Style is unlocked:

- **Bag Training** — increases Vigor (strength) and Pain tolerance
- **Walk on Coals** — increases Fear resistance and Stamina

---

## 7. Combat System

### Fight Entry

Fights may require an entry fee (currency). The player chooses to fight or skip.

### Combat Flow

- **Tap to Attack** — active taps accelerate attack timing (clicker element)
- **Attack & Block** — alternating offensive and defensive input
- **Stamina Decrease** — stamina depletes during a fight; exhausted fighters lose effectiveness
- **Super Meter** — fills on successful attacks/blocks; unleashes powerful moves

### Move System

Moves are identified by position and limb: **L/R × H/F/G** (Left/Right × Hand/Foot/Grab).

Each Style unlocks a subset of moves from the full move list. Some moves are universally available; others are Style-exclusive.

### Combat Stats

| Stat | Description |
|------|-------------|
| Vigor | Raw striking power |
| Agility | Speed and evasion |
| Constitution | Damage absorption |
| Stamina | Fight endurance |
| Skill | Accuracy, combo chains |

### Status Effects

- **Stun** — brief attack interruption
- **Trip** — knockdown state
- **Wrist Lock** — grab-based temporary disarm / damage modifier

### Ranked Tournaments

Unlocked after a threshold of wins. Rank is tied to tournament performance. The highest-ranked active fighter holds the Belt.

---

## 8. Economy & Progression

### Currency ($)

Money is earned by:
- Winning fights
- A low-yield passive income method available from the start (the "poor way to get $")

### Unlock Thresholds

| Unlock | Requirement |
|--------|-------------|
| Shop | Accumulate a money threshold |
| Sensei / Style | Win count + money threshold |
| Ranked Tournaments | Win count threshold |

### Shop

The Shop sells:
- Equipment (stat bonuses)
- Consumables
- Coaches (see Items)

---

## 9. Items

### Equipment

Wearable gear providing stat bonuses. Purchased in the Shop.

### Coaches

Hired NPCs that improve training speed or effectiveness for specific stats or styles.

### Relics

Rare passive items with unique effects. (Design TBD)

### Other (Exploratory)

- **Haus** — fighter headquarters / facility upgrades (Design TBD)
- **Diet** — consumable / passive nutrition bonuses (Design TBD)

---

## 10. Animals (Race System Detail)

### C-C-C-Combo! Integration

Certain move chains (combos) are Race-specific, tied to the style system.

### Lore

| Animal | Name | Notes |
|--------|------|-------|
| Tiger | Maotong | Aggressive, intimidating, explosive |
| Snow Leopard | Mingtian | Evasive, high-altitude, patient |

### Race Stats (IV Analogy)

Each Race has innate stat spreads (like Pokémon IVs) that cannot be trained away — they are fixed at character creation.

---

## 11. Character Lifecycle & Death

### Aging

Characters age over real or in-game time. As a fighter ages:
- Peak performance degrades
- Certain training methods become unavailable
- The player is warned to prepare for retirement

### Death & Retirement

Death/retirement triggers are Race-dependent and may be influenced by in-game choices (karma, risky fights, Bloodlust status effect).

On death/retirement:
- An **Instant Replay** of the fighter's greatest moment plays
- The player's record and stats are archived
- **Ancestor Points (PP — "Predecessor Points" or similar)** are calculated from:
  - Total wins
  - Money earned
  - Ranks achieved
  - Style mastered

### Ancestor Points

Ancestor Points are invested into the next fighter at creation, providing a head start in stats, money, or unlocks. This creates a prestige-loop meta-progression layer.

### Bloodlust

A status effect — possibly triggered by specific training methods or combat choices — that increases power but accelerates aging or death risk.

---

## 12. Multiplayer

### Matchmaking

Most fights are against AI bots. Occasional real-player matchups occur via server-side matchmaking.

### VS Mode

Direct player-vs-player challenges.

### Clans & Raids (Exploratory)

- **Clans** — player groups with shared resources
- **Bosses / Raids** — cooperative or competitive high-difficulty fights against powerful NPCs

---

## 13. Idle & Automation

### Idle Setting (Superset)

When the player is not actively tapping, the fighter executes an **Idle Superset** — a configurable loop of training and/or combat actions that runs in the background.

### Training Idle

- Fighters continue selected training while offline
- Style affects idle training efficiency

### Fight Idle

- Fighters can auto-fight lower-ranked opponents for slow passive income
- Tap intervention improves outcomes

---

## 14. UI & Menus

### Screen Flow

```
Title Screen → Hub (Main Menu) → [Training | Fight | Shop | Fighter | Ranks]
```

### Key Screens

| Screen | Description |
|--------|-------------|
| Title Screen | Entry point |
| Create Fighter | Race selection, name |
| Hub | Central navigation |
| Training | Select and monitor training |
| Fight | Entry fee, pre-fight ritual, combat |
| Shop | Equipment and coaches |
| Fighter Profile | Stats, style, move list, age |
| Ranks | Tournament ladder, Belt holder |
| Death Screen | Instant replay, ancestor point summary |

### ZerothFight

The first fight experience. Most options are removed. The player has no Style, minimal money, and limited training. Designed to onboard without overwhelming.

---

## 15. Thematic & Art Direction

### Tone

Muay Thaiger is set in a world that feels **humid, feverish, spiritual, and alive**. The aesthetic draws from:

- Theravada Buddhist temple culture
- Thai animist spirit beliefs (Phi, sacred shrines)
- Sak Yant tattoo mysticism
- Muay Boran folklore and Ruesi hermit traditions
- Southeast Asian jungle environments
- Khmer temple ruins

> "You cannot defeat another man until the jungle no longer frightens you."

### Visual Language

- Oil lamps flickering in rain-soaked temple courtyards
- Fighters shadowboxing beside flooded rice fields
- Cicadas screaming during afternoon heat training
- Incense smoke mixing with sweat and tiger balm
- Monks chanting while students clinch in the mud
- Sak Yant ink mixed with ash and sacred oil
- Geckos darting across shrine walls
- Banyan roots swallowing ruined statues
- Thunder rolling through jungle valleys

### Sound Design

- SFX required for: strikes, blocks, crowd, ambient jungle, temple bells, rain, spirit-house audio
- Music: traditional Thai/Southeast Asian instrumentation; dynamic layering during fights

### Cultural Pillars

The game's texture comes from five fear/mastery themes:

| Theme | Manifestation |
|-------|---------------|
| Pain | Iron conditioning, exhaustion training |
| Balance | Pole standing, rooftop running |
| Breath | Waterfall meditation, underwater training |
| Stillness | Cave isolation, Zhan Zhuang |
| Fear | Cremation grounds, spirit vigils, jungle darkness |

### The Forest Monk Archetype

A recurring teacher/master type: isolated, dangerous, eerie. Conquered fear through direct exposure to death and wilderness. Moves like an animal. Training under such a master is less "exercise" and more **fear purification** and **ego destruction**.

### Thai Mysticism Integration

- Fighters can wear amulets (passive item slots)
- Sak Yant tattoos may provide conditional stat bonuses
- Breaking spiritual conduct rules (e.g., disrespecting a teacher, lying after a yant) weakens protections
- Combat outcomes have karma consequences
- Post-fight rituals (apology to the ring spirit) are in-universe actions

### NPCs / Master Archetypes

| Archetype | Traits |
|-----------|--------|
| Cave Hermit | Knows herbs, tattoos, and brutal close-range combat |
| Drunken Ex-Nak Muay | Broken body, terrifying in clinch |
| Silent Forest Monk | Seems harmless; moves like an animal |
| Tattoo Ajarn | Half priest, half gang mystic |
| Elephant Trainer | Immovable stance, pressure and clinch dominance |
| Cremation Ground Ascetic | Has conquered fear through death exposure |
| Wandering Pilgrim Fighter | Collects techniques and blessings, never stays |

---

## 16. Open Design Questions

The following items from the raw notes are flagged as exploratory or unresolved:

- **Dice mechanic** (`!Dice??`) — role of randomness in combat
- **Robots** (`!Robots`) — AI opponent variety / automation opponents
- **Grab system** — implementation of grapple/clinch
- **Events** — time-limited special events / seasonal content
- **Stats EV system** — exact formula for training gains
- **Race-dependent death** — specific death animations / narratives per race
- **Relics** — item rarity tier and effect design
- **Haus** — headquarter facility upgrades
- **Diet** — nutrition consumables
- **Clan Raids** — full co-op/raid design
- **Entry Fee** — whether fights require payment and at what tiers
- **Robots** — bot fighter variety and AI difficulty tiers
