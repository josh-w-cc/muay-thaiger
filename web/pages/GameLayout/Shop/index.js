import Button from '@/components/Button.js';
import formatHugeNumber from '@/utils/formatHugeNumber.js';
import useFighterStore from '@/data/fighter.js';
import useInventoryStore from '@/data/inventory.js';
import Items from './Items.js';

import css from './Shop.module.css';


function Shop() {
  const buy = useInventoryStore((state) => state.buy);
  const fighter = useFighterStore();

  return (
    <section className={css.section}>
      <ShopRows buy={buy} fighter={fighter} />
    </section>
  );
}

function ShopRows({buy, fighter}) {
  return Object.keys(Items).map((itemKey) => (
    <div key={itemKey}>
      {Items[itemKey].name}
      {' '}
      {formatHugeNumber(Items[itemKey].cost)}
      ฿
      <Button onClick={() => buy(fighter, Items[itemKey])}>Buy</Button>
      <br />
    </div>
  ));
}

export default Shop;
