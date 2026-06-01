import useFightStore from '@/data/fight.js';


export default function FightInProgress() {
  const fight = useFightStore();
  const [you, them] = fight.fighters;

  return (
    <>
      <h3>Enemy Stats:</h3>
      APM:
      {' '}
      {them.stats.apm.toFormattedNumber()}
      <br />
      Attack:
      {' '}
      {them.stats.attack.toFormattedNumber()}
      <br />
      Defense:
      {' '}
      {them.stats.defense.toFormattedNumber()}
      <br />
      Health:
      {' '}
      {them.stats.health.toFormattedNumber()}
      <br />
      Power:
      {' '}
      {them.stats.power.toFormattedNumber()}
      <br />
      Stanima:
      {' '}
      {them.stats.stamina.toFormattedNumber()}
      <br />
      Health:
      {' '}
      {them.currentHealth.toFormattedNumber()}
      <h3>Stats:</h3>
      Health:
      {' '}
      {you.currentHealth.toFormattedNumber()}
      <h3>MSG</h3>
    </>
  );
}
