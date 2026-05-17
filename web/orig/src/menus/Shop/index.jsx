import React from 'react';

import useInventoryStore from '@/data/inventoryStore.js';
import Button from '../../components/Button.jsx';
import useFighterStore from '../../Fighter.js';
import Items from './Items.js';


function Shop() {
  const buy = useInventoryStore((state) => state.buy);
  const fighter = useFighterStore();

  return (<>
    <h1>SHOP</h1>
    {Object.keys(Items).map(i => <>
      {Items[i].name}
      {' '}
      {Items[i].cost}฿
      <Button onClick={() => buy(fighter, Items[i])}>Buy</Button>
      <br />
    </>)}
  </>);
}

export default Shop;
