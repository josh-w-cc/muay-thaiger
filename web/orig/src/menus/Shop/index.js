import React from 'react';

import Button from '@/components/Button.js';
import formatHugeNumber from '@/utils/formatHugeNumber.js';
import useFighterStore from '@/data/fighter.js';
import useInventoryStore from '@/data/inventory.js';
import Items from './Items.js';


function Shop() {
  const buy = useInventoryStore((state) => state.buy);
  const fighter = useFighterStore();

  return (<>
    <h1>SHOP</h1>
    {Object.keys(Items).map(i => <>
      {Items[i].name}
      {' '}
      {formatHugeNumber(Items[i].cost)}฿
      <Button onClick={() => buy(fighter, Items[i])}>Buy</Button>
      <br />
    </>)}
  </>);
}

export default Shop;
