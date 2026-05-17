import useInventoryStore, {COST_MULTIPLIER, resetInventoryStore} from './Inventory.js';


describe('useInventoryStore', () => {
  afterEach(() => {
    resetInventoryStore();
  });

  it('buys an item when the fighter can afford it', () => {
    const {fighter, spend} = createMockFighter(600);
    const item = {cost: 5};

    useInventoryStore.getState().buy(fighter, item);

    expect(useInventoryStore.getState().items).toEqual([item]);
    expect(spend).toHaveBeenCalledWith(item.cost * COST_MULTIPLIER);
  });

  it('does not buy an item when the fighter cannot afford it', () => {
    const {fighter, spend} = createMockFighter(499);
    const item = {cost: 5};

    useInventoryStore.getState().buy(fighter, item);

    expect(useInventoryStore.getState().items).toEqual([]);
    expect(spend).not.toHaveBeenCalled();
  });
});


function createMockFighter(gold) {
  const spend = vi.fn();
  return {
    fighter: {gold, spend},
    spend,
  };
}
