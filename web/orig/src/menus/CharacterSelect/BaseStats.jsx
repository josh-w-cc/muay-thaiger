import Tiger from './assets/Tiger.png';
import SnowLeopard from './assets/SnowLeopard.png';

const RACE_IMAGES = {
  1: Tiger,
  2: SnowLeopard,
};

export const RACE_STATICS = [
  {
    id: 1,
    name: 'Tiger',
    stats: {anima: 1, durability: 1, reach: 2, speed: 1, strength: 2, vitality: 2},
  },
  {
    id: 2,
    name: 'Snow Leopard',
    stats: {anima: 2, durability: 2, reach: 1, speed: 2, strength: 1, vitality: 1},
  },
];

const BaseStats = Object.fromEntries(
  RACE_STATICS
    .map((item) => [`${item.id}`, {
      id: item.id,
      image: RACE_IMAGES[item.id],
      name: item.name,
      stats: item.stats,
    }]),
);

export default BaseStats;
