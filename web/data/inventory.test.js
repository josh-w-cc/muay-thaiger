import useInventoryStore, {COST_MULTIPLIER, resetInventoryStore} from './inventory.js';


const AFFORDABLE_GOLD = 600n;
const UNAFFORDABLE_GOLD = 499n;


describe('useInventoryStore', () => {
  afterEach(() => {
    resetInventoryStore();
  });

  it('buys an item when the fighter can afford it', () => {
    const {fighter, spend} = createMockFighter(AFFORDABLE_GOLD);
    const item = {cost: 5};

    useInventoryStore.getState().buy(fighter, item);

    expect(useInventoryStore.getState().items).toEqual([item]);
    expect(spend).toHaveBeenCalledWith(BigInt(item.cost) * BigInt(COST_MULTIPLIER));
  });

  it('does not buy an item when the fighter cannot afford it', () => {
    const {fighter, spend} = createMockFighter(UNAFFORDABLE_GOLD);
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
