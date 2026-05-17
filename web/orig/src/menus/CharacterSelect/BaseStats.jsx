import Tiger from './assets/Tiger.png';
import SnowLeopard from './assets/SnowLeopard.png';

const BaseStats = {
  SnowLeopard: {
    name: 'Shadow Kitty!',
    image: SnowLeopard,
    stats: {
      anima: 2,
      durability: 2,
      reach: 1,
      speed: 2,
      strength: 1,
      vitality: 1,
    },
  },
  Tiger: {
    name: 'Matthew',
    image: Tiger,
    stats: {
      anima: 1,
      durability: 1,
      reach: 2,
      speed: 1,
      strength: 2,
      vitality: 2,
    },
  },
};

export default BaseStats;