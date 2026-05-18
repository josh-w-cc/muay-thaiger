import React from 'react';

import formatHugeNumber from "@/utils/formatHugeNumber.js";
import {fetchJSON} from '@/utils/fetchAPI.js';
import useFighterStore from '../../Fighter.js';
import Button from '../../components/Button.jsx';
import BaseStats from './BaseStats.js';

import css from './CharacterSelect.module.css';


function CharacterSelect({onExit}) {
  const fighter = useFighterStore();
  const [raceStatics, setRaceStatics] = React.useState(() => getBaseRaceStatics());

  React.useEffect(() => {
    let isMounted = true;
    fetchJSON('race')
      .then((races) => {
        if(!isMounted || !Array.isArray(races) || races.length === 0) {
          return;
        }
        setRaceStatics(races);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

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

function getBaseRaceStatics() {
  return Object.values(BaseStats).map((raceStatic) => ({
    id: raceStatic.id,
    name: raceStatic.name,
    stats: raceStatic.stats,
  }));
}

function getRaceImage(raceID) {
  return BaseStats[`${raceID}`]?.image;
}
