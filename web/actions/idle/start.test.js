import {SKILL_IDS} from 'shared/skills/index.js';

import startIdle from './start.js';


const {addAction, createFighterActionCmd} = vi.hoisted(() => ({
  addAction: vi.fn(),
  createFighterActionCmd: vi.fn(),
}));

vi.mock('@/actions/websockets/clientCommands.js', () => ({
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

    expect(addAction).toHaveBeenCalledWith({action: SKILL_IDS.begging});
    expect(createFighterActionCmd).toHaveBeenCalledWith(SKILL_IDS.begging);
  });

  it('throws and does not enqueue or send a command when the skill id is invalid', () => {
    expect(() => startIdle({skillKey: 'invalid'})).toThrow('Unknown skill!?');

    expect(addAction).not.toHaveBeenCalled();
    expect(createFighterActionCmd).not.toHaveBeenCalled();
  });
});
