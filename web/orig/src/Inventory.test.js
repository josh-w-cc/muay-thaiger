import useInventoryStore, {resetInventoryStore} from './Inventory.js';


describe('useInventoryStore', () => {
  afterEach(() => {
    resetInventoryStore();
  });

  it('buys an item when the fighter can afford it', () => {
    const spend = vi.fn();
    const fighter = {gold: 600, spend};
    const item = {cost: 5};

    useInventoryStore.getState().buy(fighter, item);

    expect(useInventoryStore.getState().items).toEqual([item]);
    expect(spend).toHaveBeenCalledWith(500);
  });

  it('does not buy an item when the fighter cannot afford it', () => {
    const spend = vi.fn();
    const fighter = {gold: 499, spend};
    const item = {cost: 5};

    useInventoryStore.getState().buy(fighter, item);

    expect(useInventoryStore.getState().items).toEqual([]);
    expect(spend).not.toHaveBeenCalled();
  });
});
