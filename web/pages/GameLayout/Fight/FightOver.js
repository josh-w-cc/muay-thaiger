import {createFightCmd} from '@/actions/websockets/clientCommands.js';
import Button from '@/components/Button.js';


export default function FightOver() {
  return (
    <Button onClick={() => createFightCmd()}>
      Again?
    </Button>
  );
}
