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
      fighter.train('stamina', 2);
    },
    requires: (fighter) => fighter.stamina > 50,
  },
  breathwork: {
    name: 'Breathwork',
    action: (fighter) => {
      fighter.train('constitution');
      fighter.train('stamina');
    },
    requires: (fighter) => fighter.stamina > 50,
  },
  yoga: {
    name: 'Yoga',
    action: (fighter) => {
      fighter.train('agility');
      fighter.train('strength');
      fighter.train('constitution');
    },
    requires: (fighter) => fighter.stamina > 100 && fighter.constitution > 1,
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
  run: {
    name: 'Running',
    action: (fighter) => {
      fighter.train('stamina', 125);
    },
    requires: (fighter) => fighter.stamina > 10000 && fighter.constitution > 100,
  },
  gymnastics: {
    name: 'Gymnastics',
    action: (fighter) => {
      fighter.train('stamina', 15);
      fighter.train('strength', 15);
      fighter.train('constitution', 5);
      fighter.train('agility', 25);
    },
    requires: (fighter) => fighter.stamina > 10000 && fighter.strength > 1000 && fighter.constitution > 1000 && fighter.agility > 1000,
  },
};

export default Skills;
