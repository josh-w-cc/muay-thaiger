export const SKILL_DEFINITIONS = Object.freeze({
  gymnastics: {
    action: (fighter) => {
      fighter.train('stamina', 5n);
      fighter.train('strength', 5n);
      fighter.train('constitution', 1n);
      fighter.train('agility', 15n);
    },
    description: 'Increases agility',
    name: 'Gymnastics',
    requires: (fighter) => fighter.stamina > 2500n && fighter.strength > 250n && fighter.agility > 500n,
    duration: 8,
  },
  running: {
    action: (fighter) => {
      fighter.train('stamina', 25n);
    },
    name: 'Running',
    description: 'Increases stamina',
    requires: (fighter) => fighter.stamina > 1000n && fighter.constitution > 250n,
    duration: 8,
  },
  laboring: {
    action: (fighter) => {
      fighter.win(100n);
      fighter.train('stamina', 1n);
      fighter.train('strength', 1n);
      fighter.train('constitution', 1n);
    },
    name: 'La฿oring',
    description: 'Better than ฿egging',
    requires: (fighter) => fighter.stamina > 500n && fighter.constitution > 100n && fighter.strength > 100n,
    duration: 4,
  },
  calisthenics: {
    action: (fighter) => {
      fighter.train('stamina', 5n);
      fighter.train('strength', 3n);
      fighter.train('constitution', 1n);
    },
    description: 'Slightly increases stamina',
    name: 'Calisthenics',
    requires: (fighter) => fighter.stamina > 250n && fighter.constitution > 10n && fighter.strength > 25n,
    duration: 4,
  },
  yoga: {
    action: (fighter) => {
      fighter.train('agility');
      fighter.train('strength');
      fighter.train('constitution');
    },
    name: 'Yoga',
    description: 'Very slightly increases agility, constitution, & strength',
    requires: (fighter) => fighter.stamina > 100n,
    duration: 2,
  },
  breathwork: {
    action: (fighter) => {
      fighter.train('constitution');
      fighter.train('stamina');
    },
    name: 'Breathwork',
    description: 'Very slightly increases stamina & constitution',
    requires: (fighter) => fighter.stamina > 50n,
    duration: 2,
  },
  shadowBoxing: {
    action: (fighter) => {
      fighter.train('stamina', 3n);
    },
    name: 'Shadow Boxing',
    description: 'Very slightly increases stamina',
    requires: (fighter) => fighter.stamina > 25n,
    duration: 2,
  },
  walking: {
    action: (fighter) => {
      fighter.train('stamina');
    },
    name: 'Walking',
    description: 'Everybody starts somewhere...',
    requires: () => true,
    duration: 1,
  },
  begging: {
    action: (fighter) => {
      fighter.win(1n);
    },
    name: '฿egging',
    description: 'Spare a satang?',
    requires: () => true,
    duration: 1,
  },
});
