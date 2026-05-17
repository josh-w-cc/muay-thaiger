import React from 'react';

import Button from '../../components/Button.jsx';
import Inventory from '../../Inventory.js';
import Fighter from '../../Fighter.js';
import Items from "./Items.js";


function Shop() {
  const items = React.useContext(Inventory);
  const fighter = React.useContext(Fighter);

  return (<>
    <h1>SHOP</h1>
    {Object.keys(Items).map(i => <>
      {Items[i].name}
      {' '}
      {Items[i].cost}฿
      <Button onClick={() => items.buy(fighter, Items[i])}>Buy</Button>
      <br />
    </>)}
  </>);
}

export default Shop;
