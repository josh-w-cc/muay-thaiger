import useFighterStore from '@/data/fighter.js';
import useFightStore from '@/data/fight.js';
import {createFightCmd} from '@/actions/websockets/clientCommands.js';
import Button from '@/components/Button.js';
import Section from '@/components/primitive/Section.js';

import ActiveFight from './ActiveFight/index.js';
import FightForGlory from './FightForGlory/index.js';
import ZerothFight, {needsZerothFight} from './ZerothFight.js';


export default function FightMenu() {
  const fight = useFightStore();
  const fighter = useFighterStore();

  if(needsZerothFight(fighter)) {
    return (<ZerothFight />);
  }

  return (
    <>
      <Section>
        <h1>Fight for ฿</h1>
        <FightContent fight={fight} />
      </Section>
      <FightForGlory />
    </>
  );
}

function FightContent({fight}) {
  if(fight.id === null) {
    return (
      <Button onClick={() => createFightCmd('gold')}>Fight!</Button>
    );
  }

  return (
    <>
      <p>Fight pending...</p>
      <ActiveFight />
      <FightMetadata label="Fight ID" value={fight.id} />
      <FightMetadata label="Reason" value={fight.reason} />
      <FightMetadata label="Created" value={fight.created_at} />
      <FightMetadata label="Details" value={formatFightDetails(fight.details)} />
    </>
  );
}

function FightMetadata({label, value}) {
  if(!value) {
    return null;
  }

  return (
    <p>
      {label}
      :
      {' '}
      {value}
    </p>
  );
}

function formatFightDetails(details) {
  if(details == null) {
    return null;
  }
  return (<pre>{JSON.stringify(details, null, 2)}</pre>);
}
