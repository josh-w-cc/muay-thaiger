import useFighterActionsStore, {resetFighterActionsStore} from './fighterActions.js';


describe('useFighterActionsStore', () => {
  afterEach(() => {
    vi.clearAllMocks();
    resetFighterActionsStore();
  });

  it('stores fighter actions list', () => {
    const actions = [{id: 2}, {id: 3}];

    useFighterActionsStore.getState().setActions(actions);

    expect(useFighterActionsStore.getState().actions).toEqual(actions);
  });

  it('appends a fighter action', () => {
    useFighterActionsStore.getState().setActions([{id: 2}]);
    const action = {id: 3};

    useFighterActionsStore.getState().addAction(action);

    expect(useFighterActionsStore.getState().actions).toEqual([{id: 2}, action]);
  });
});
