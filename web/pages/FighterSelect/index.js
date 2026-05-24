import formatHugeNumber from '@/utils/formatHugeNumber.js';
import selectFighter from '@/actions/selectFighter.js';
import Button from '@/components/Button.js';
import SnowLeopard from './assets/SnowLeopard.png';
import Tiger from './assets/Tiger.png';

import css from './FighterSelect.module.css';


const RACE_IMAGES_BY_ID = {
  1: Tiger,
  2: SnowLeopard,
};

function FighterSelect({races = []}) {
  return (
    <>
      <h1>Choose your fighter:</h1>
      <div className={css.cards}>
        {races.map((race) => (
          <FighterCard
            key={race.id}
            name={race.name}
            image={getRaceImage(race.id)}
            stats={race.stats}
            onSelect={() => {
              selectFighter(`${race.id}`);
            }}
          />
        ))}
      </div>
    </>
  );
}
export default FighterSelect;


function FighterCard({image, name, onSelect, stats}) {
  return (
    <div className={css.outer}>
      <h3>{name}</h3>
      <FighterCardBody image={image} name={name} onSelect={onSelect} stats={stats} />
    </div>
  );
}

function getRaceImage(raceID) {
  return RACE_IMAGES_BY_ID[raceID];
}

function FighterCardBody({image, name, onSelect, stats}) {
  return (
    <div className={css.inner}>
      <img alt={name} src={image} className={css.avatar} />
      <div className={css.stats}>
        {renderStats(stats)}
        <Button onClick={onSelect} style={{fontWeight: 'bold', fontSize: 'larger'}}>CHOOSE</Button>
      </div>
    </div>
  );
}

function renderStats(stats) {
  return [
    ['Speed', stats.speed],
    ['Vigor', stats.vigor],
    ['Vitality', stats.vitality],
    ['Anima', stats.anima],
    ['Durability', stats.durability],
    ['Reach', stats.reach],
  ].map(([label, value]) => (
    <div key={label}>
      {label}
      :
      {' '}
      {formatHugeNumber(value)}
    </div>
  ));
}
