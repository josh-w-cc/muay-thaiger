import {SKILL_IDS} from 'shared/skills.js';

import startIdle from './startIdle.js';


const {createFighterActionCmd} = vi.hoisted(() => ({
  createFighterActionCmd: vi.fn(),
}));

vi.mock('@/data/websocket.js', () => ({
  createFighterActionCmd: (...args) => createFighterActionCmd(...args),
}));

describe('startIdle', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts idle training and sends a fighter action command', () => {
    const action = vi.fn();
    const fighter = {idle: vi.fn()};
    const skill = {action};

    startIdle({fighter, skill, skillKey: 'begging'});

    expect(fighter.idle).toHaveBeenCalledTimes(1);
    expect(fighter.idle).toHaveBeenCalledWith('train-begging', expect.any(Function));
    expect(createFighterActionCmd).toHaveBeenCalledWith(SKILL_IDS.begging);
  });
});
