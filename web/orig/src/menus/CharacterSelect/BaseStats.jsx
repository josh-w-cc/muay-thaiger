import {SEED_STATICS} from '../../../../../api/data/seed-data/seeds/001-sample-board.js';
import Tiger from './assets/Tiger.png';
import SnowLeopard from './assets/SnowLeopard.png';

const IMAGE_BY_RACE_NAME = {
  'Snow Leopard': SnowLeopard,
  Tiger,
};

const BaseStats = Object.fromEntries(
  [...SEED_STATICS]
    .filter(({type}) => type === 'race')
    .sort((firstRace, secondRace) => secondRace.id - firstRace.id)
    .map(({name, stats}) => [toRaceKey(name), {image: IMAGE_BY_RACE_NAME[name], name, stats}]),
);

export default BaseStats;


function toRaceKey(name) {
  return name.replaceAll(' ', '');
}
