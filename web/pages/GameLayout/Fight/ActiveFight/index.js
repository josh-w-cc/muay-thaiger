import FightFeed from './FightFeed.js';
import FightFighters from './FightFighters.js';
import FightLoadout from './FightLoadout.js';


export default function ActiveFight({details}) {
  return (
    <>
      <FightLoadout details={details} />
      <FightFighters details={details} />
      <FightFeed details={details} />
    </>
  );
}
