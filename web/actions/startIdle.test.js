import {SKILL_IDS} from 'shared/skills.js';

import startIdle from './startIdle.js';


const {addAction, createFighterActionCmd} = vi.hoisted(() => ({
  addAction: vi.fn(),
  createFighterActionCmd: vi.fn(),
}));

vi.mock('@/actions/websockets/index.js', () => ({
  createFighterActionCmd: (...args) => createFighterActionCmd(...args),
}));

vi.mock('@/data/fighterActions.js', () => ({
  default: {
    getState: () => ({addAction}),
  },
}));

describe('startIdle', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts idle training and sends a fighter action command', () => {
    startIdle({skillKey: 'begging'});

    expect(addAction).toHaveBeenCalledWith({action_id: SKILL_IDS.begging});
    expect(createFighterActionCmd).toHaveBeenCalledWith(SKILL_IDS.begging);
  });

  it('does not enqueue or send a command when the skill id is invalid', () => {
    startIdle({skillKey: 'invalid'});

    expect(addAction).not.toHaveBeenCalled();
    expect(createFighterActionCmd).not.toHaveBeenCalled();
  });
});
