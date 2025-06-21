import Tiger from './assets/Tiger.png';
import SnowLeopard from './assets/SnowLeopard.png';

const BaseStats = {
  SnowLeopard: {
    name: 'Shadow Kitty!',
    image: SnowLeopard,
    stats: {
      innateSpeed: 2,
      innateStrength: 1,
      vitality: 1,
      anima: 2,
      durability: 2,
      reach: 1,
    },
  },
  Tiger: {
    name: 'Matthew',
    image: Tiger,
    stats: {
      innateSpeed: 1,
      innateStrength: 2,
      vitality: 2,
      anima: 1,
      durability: 1,
      reach: 2,
    },
  },
};

export default BaseStats;