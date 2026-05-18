import React from 'react';

import formatHugeNumber from '@/utils/formatHugeNumber.js';
import useFighterStore from '../../Fighter.js';
import Button from '../../components/Button.jsx';
import SnowLeopard from './assets/SnowLeopard.png';
import Tiger from './assets/Tiger.png';

import css from './CharacterSelect.module.css';


const RACE_IMAGES_BY_ID = {
  1: Tiger,
  2: SnowLeopard,
};

function CharacterSelect({onExit, raceStatics = []}) {
  const fighter = useFighterStore();

  return (<>
    <h1>Choose your fighter:</h1>
    {raceStatics.map((raceStatic) =>
      <Character key={raceStatic.id} name={raceStatic.name} image={getRaceImage(raceStatic.id)} stats={raceStatic.stats} onSelect={() => {
        fighter.select(`${raceStatic.id}`);
        onExit(`${raceStatic.id}`);
      }} />)
    }
  </>);
}
export default CharacterSelect;


function Character({name, image, stats, onSelect}) {
  return (<div className={css.outer}>
    <h3>{name}</h3>
    <div className={css.inner}>
      <img src={image} className={css.avatar} />
      <div className={css.stats}>
        Speeed: {formatHugeNumber(stats.speed)}<br/>
        Strength: {formatHugeNumber(stats.strength)}<br/>
        Vitality: {formatHugeNumber(stats.vitality)}<br/>
        Anima: {formatHugeNumber(stats.anima)}<br/>
        Durability: {formatHugeNumber(stats.durability)}<br/>
        Reach: {formatHugeNumber(stats.reach)}<br/>
        <Button onClick={onSelect} style={{fontWeight: 'bold', fontSize: 'larger'}}>CHOOSE</Button>
      </div>
    </div>
  </div>);
}

function getRaceImage(raceID) {
  return RACE_IMAGES_BY_ID[raceID];
}
