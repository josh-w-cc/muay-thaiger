import StatRow from '@/components/primitive/StatRow.js';
import useFighterStore from '@/data/fighter.js';


export default function TrainStat({name, stat}) {
  const fighter = useFighterStore();

  return (
    <StatRow label={name} value={fighter[stat].toFormattedNumber()} />
  );
}
