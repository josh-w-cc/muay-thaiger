import React from 'react';

import formatHugeNumber from "@/utils/formatHugeNumber.js";
import useFighterStore from '../../Fighter.js';


function TrainStat({name, stat}) {
  const fighter = useFighterStore();

  return (<>
    {name}: {formatHugeNumber(fighter[stat])}
    <br/>
  </>);
}
export default TrainStat;
