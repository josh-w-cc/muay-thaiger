import React from 'react';

import CharacterSelect from './menus/CharacterSelect';
import Fight from './menus/Fight.jsx';
import Header from './menus/Header.jsx';
import Hub from './menus/Hub.jsx';
import Train from './menus/Train.jsx';

import './App.css';


function App() {
  const [screen, setScreen] = React.useState('character-select');
  let content;
  switch(screen) {
    case 'hub':
      content = (<Hub setScreen={setScreen} />);
      break;
    case 'fight':
      content = (<Fight />);
      break;
    case 'train':
      content = (<Train />);
      break;
    case 'character-select':
      return (<CharacterSelect onExit={() => setScreen('hub')} />);
    default:
      content = (<>
        <h1>Yuo broke it!?</h1>
        <button onClick={() => setScreen('hub')}>We have to go back</button>
      </>);
  }
  return (<>
    <Header setScreen={setScreen} />
    {content}
  </>);
}

export default App;
