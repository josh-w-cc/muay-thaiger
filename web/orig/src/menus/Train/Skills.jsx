const Skills = {
  beg: {
    name: '฿egging',
    action: (fighter) => {
      fighter.win(1);
    },
    requires: () => true,
  },
  walk: {
    name: 'Walking',
    action: (fighter) => {
      fighter.train('stamina');
    },
    requires: () => true, //Always available
  },
  shadowbox: {
    name: 'Shadow Boxing',
    action: (fighter) => {
      fighter.train('agility', 3);
      fighter.train('skill', 2);
      fighter.train('stamina', 2);
    },
    requires: (fighter) => fighter.stamina > 50,
  },
  breathwork: {
    name: 'Breathwork',
    action: (fighter) => {
      fighter.train('constitution', 2);
      fighter.train('skill', 3);
      fighter.train('stamina', 1);
    },
    requires: (fighter) => fighter.stamina > 250 && fighter.skill > 10,
  },
  yoga: {
    name: 'Yoga',
    action: (fighter) => {
      fighter.train('agility');
      fighter.train('strength');
      fighter.train('constitution');
    },
    requires: (fighter) => fighter.stamina > 100,
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
    name: 'La฿oring',
    action: (fighter) => {
      fighter.win(100);
      fighter.train('stamina', 1);
      fighter.train('strength', 1);
      fighter.train('constitution', 1);
    },
    requires: (fighter) => fighter.stamina > 1000 && fighter.constitution > 1000 && fighter.strength > 1000,
  },
  clinch: {
    name: 'Clinch Drills',
    action: (fighter) => {
      fighter.train('constitution', 6);
      fighter.train('skill', 2);
      fighter.train('strength', 6);
    },
    requires: (fighter) => fighter.constitution > 750 && fighter.strength > 750,
  },
  run: {
    name: 'Running',
    action: (fighter) => {
      fighter.train('stamina', 125);
    },
    requires: (fighter) => fighter.stamina > 10000 && fighter.constitution > 100,
  },
};

export default Skills;
