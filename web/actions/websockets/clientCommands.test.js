import useFighterActionsStore, {resetFighterActionsStore} from '@/data/fighterActions.js';
import useFighterStore, {resetFighterStore} from '@/data/fighter.js';
import usePlayerStore, {resetPlayerStore} from '@/data/player.js';
import {onSocketCommand} from './clientCommands.js';


describe('client websocket commands', () => {
  afterEach(() => {
    vi.clearAllMocks();
    resetFighterActionsStore();
    resetFighterStore();
    resetPlayerStore();
  });

  it('overwrites client player and fighter state from player_state', () => {
    usePlayerStore.getState().selectFighter('99');
    usePlayerStore.getState().setPlayerID(999);
    useFighterActionsStore.getState().setActions([{id: 5}]);

    onSocketCommand.player_state({
      actions: [{action_id: 2, id: 11}],
      fighter: {
        gold: '250',
        id: 9,
        player_id: 77,
        race: 2,
        stats: {agility: 6, stamina: 7, strength: 8},
      },
    });

    expect(usePlayerStore.getState().playerID).toBe(77);
    expect(usePlayerStore.getState().selectedRace).toBe('2');
    expect(useFighterActionsStore.getState().actions).toEqual([{action_id: 2, id: 11}]);
    expect(useFighterStore.getState().gold).toBe(250);
    expect(useFighterStore.getState().id).toBe(9);
    expect(useFighterStore.getState().race).toBe('2');
    expect(useFighterStore.getState().agility).toBe(6);
    expect(useFighterStore.getState().stamina).toBe(7);
    expect(useFighterStore.getState().strength).toBe(8);
  });

  it('ignores player_state commands without fighter data', () => {
    const initialFighterID = useFighterStore.getState().id;

    onSocketCommand.player_state({});

    expect(useFighterStore.getState().id).toBe(initialFighterID);
  });
});
