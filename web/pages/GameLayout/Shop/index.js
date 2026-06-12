import Button from '@/components/Button.js';
import Section from '@/components/primitive/Section.js';
import useFighterStore from '@/data/fighter.js';
import useInventoryStore from '@/data/inventory.js';
import Items from './Items.js';

export default function Shop() {
  const buy = useInventoryStore((state) => state.buy);
  const fighter = useFighterStore();

  return (
    <Section>
      <ShopRows buy={buy} fighter={fighter} />
    </Section>
  );
}

function ShopRows({buy, fighter}) {
  return Object.keys(Items).map((itemKey) => (
    <div key={itemKey}>
      {Items[itemKey].name}
      {' '}
      {Items[itemKey].cost.toFormattedNumber()}
      ฿
      <Button onClick={() => buy(fighter, Items[itemKey])}>Buy</Button>
      <br />
    </div>
  ));
}
