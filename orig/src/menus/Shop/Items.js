const Items = {
  food: {
    name: 'Food',
    cost: 1,
    tick: () => {},
    train: (fighter) => {
      console.log('yummy');
    },
  },
  biz: {
    name: 'Dry Cleaners',
    cost: 1000000,
    tick: (delta) => {},
    train: () => {},
  },
};

export default Items