import {createFightCmd} from '@/actions/websockets/clientCommands.js';
import Button from '@/components/Button.js';


export default function FightNotStarted() {
  return (
    <Button onClick={() => createFightCmd('gold')}>Fight!</Button>
  );
}
