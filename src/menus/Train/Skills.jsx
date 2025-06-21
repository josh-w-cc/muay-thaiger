const Skills = {
  beg: {
    name: 'Begging',
    action: (fighter) => {
      fighter.gold += 1;
      fighter.train('constitution');
    },
    requires: (fighter) => fighter.stamina > 10,
  },
  walk: {
    name: 'Walking',
    action: (fighter) => {
      fighter.train('stamina');
    },
    requires: () => true, //Always available
  },
  yoga: {
    name: 'Yoga',
    action: (fighter) => {
      fighter.train('stamina');
      fighter.train('strength');
      fighter.train('constitution');
    },
    requires: (fighter) => fighter.stamina > 10 && fighter.constitution > 100,
  },
  calisthenics: {
    name: 'Calisthenics',
    action: (fighter) => {
      fighter.train('stamina', 10);
      fighter.train('strength', 7);
      fighter.train('constitution', 5);
    },
    requires: (fighter) => fighter.stamina > 1000 && fighter.constitution > 100 && fighter.strength > 100,
  },
  labor: {
    name: 'Laboring',
    action: (fighter) => {
      fighter.gold += 100;
      fighter.train('stamina', 1);
      fighter.train('strength', 1);
      fighter.train('constitution', 1);
    },
    requires: (fighter) => fighter.stamina > 1000 && fighter.constitution > 1000 && fighter.strength > 1000,
  },
  run: {
    name: 'Running',
    action: (fighter) => {
      fighter.train('stamina', 125);
    },
    requires: (fighter) => fighter.stamina > 10000 && fighter.constitution > 1000,
  },
};

export default Skills;