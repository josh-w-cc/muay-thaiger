import FightFeed from './FightFeed.js';
import FightFighters from './FightFighters.js';
import FightLoadout from './FightLoadout.js';
import usePunchAnimation from './usePunchAnimation.js';


export default function ActiveFight({details}) {
  const {isPunching, triggerPunch} = usePunchAnimation();

  return (
    <>
      <FightLoadout details={details} onMove={triggerPunch} />
      <FightFighters details={details} isPunching={isPunching} />
      <FightFeed details={details} />
    </>
  );
}
