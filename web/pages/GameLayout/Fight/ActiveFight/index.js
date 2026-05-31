import FightFeed from './FightFeed.js';
import FightFighters from './FightFighters.js';
import FightLoadout from './FightLoadout.js';


export default function ActiveFight() {
  return (
    <>
      <FightLoadout />
      <FightFighters />
      <FightFeed />
    </>
  );
}
