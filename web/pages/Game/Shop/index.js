import Button from '@/components/Button.js';
import formatHugeNumber from '@/utils/formatHugeNumber.js';
import useFighterStore from '@/data/fighter.js';
import useInventoryStore from '@/data/inventory.js';
import Items from './Items.js';


function Shop() {
  const buy = useInventoryStore((state) => state.buy);
  const fighter = useFighterStore();

  return (
    <>
      <h1>SHOP</h1>
      {Object.keys(Items).map((itemKey) => (
        <div key={itemKey}>
          {renderItem({buy, fighter, item: Items[itemKey]})}
        </div>
      ))}
    </>
  );
}

export default Shop;


function renderItem({buy, fighter, item}) {
  return (
    <>
      {item.name}
      {' '}
      {formatHugeNumber(item.cost)}
      ฿
      <Button onClick={() => buy(fighter, item)}>Buy</Button>
      <br />
    </>
  );
}
