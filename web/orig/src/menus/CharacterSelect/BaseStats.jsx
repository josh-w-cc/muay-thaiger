import Tiger from './assets/Tiger.png';
import SnowLeopard from './assets/SnowLeopard.png';
import {SEED_STATICS} from '../../../../../api/data/seed-data/seeds/001-sample-board.js';

const RACE_IMAGES = {
  'Snow Leopard': SnowLeopard,
  Tiger,
};

const BaseStats = Object.fromEntries(
  SEED_STATICS
    .filter((item) => item.type === 'race')
    .sort((left, right) => right.id - left.id)
    .map((item) => [item.name.replaceAll(' ', ''), {
      image: RACE_IMAGES[item.name],
      name: item.name,
      stats: item.stats,
    }]),
);

export default BaseStats;
