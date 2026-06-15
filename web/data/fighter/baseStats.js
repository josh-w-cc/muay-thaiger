import SnowLeopard from '@/pages/FighterSelect/assets/SnowLeopard.png';
import Tiger from '@/pages/FighterSelect/assets/Tiger.png';
import {RACES} from 'shared/races.js';

const RACE_IMAGES = {
  1: Tiger,
  2: SnowLeopard,
};

const BaseStats = Object.fromEntries(
  RACES
    .map((item) => [`${item.id}`, {
      id: item.id,
      image: RACE_IMAGES[item.id],
      name: item.name,
      stats: item.stats,
    }]),
);
export default BaseStats;
