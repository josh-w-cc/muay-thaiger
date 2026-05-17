import React from 'react';

import Fighter from '../../Fighter.js';
import Button from '../../components/Button.jsx';
import BaseStats from './BaseStats.jsx';

import css from './CharacterSelect.module.css';


function CharacterSelect({onExit}) {
  const fighter = React.useContext(Fighter);

  return (<>
    <h1>Choose your fighter:</h1>
    {Object.keys(BaseStats).map(c =>
      <Character key={c} name={BaseStats[c].name} image={BaseStats[c].image} stats={BaseStats[c].stats} onSelect={() => {
        fighter.select(c);
        onExit();
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
        Speeed: {stats.speed}<br/>
        Strength: {stats.innateStrength}<br/>
        Vitality: {stats.vitality}<br/>
        Anima: {stats.anima}<br/>
        Durability: {stats.durability}<br/>
        Reach: {stats.reach}<br/>
        <Button onClick={onSelect} style={{fontWeight: 'bold', fontSize: 'larger'}}>CHOOSE</Button>
      </div>
    </div>
  </div>);
}
