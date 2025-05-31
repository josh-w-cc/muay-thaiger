import React from 'react';

function Header({setScreen}) {
  return (<>
    <button onClick={() => setScreen('fight')}>Fight</button>
    <button onClick={() => setScreen('hub')}>Hub</button>
    <button onClick={() => setScreen('train')}>Train</button>
  </>);
}

export default Header;
