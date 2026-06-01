import {SKILL_IDS} from 'shared/skills/index.js';

import stopIdle from './stopIdle.js';


const {removeAction, removeFighterActionCmd} = vi.hoisted(() => ({
  removeAction: vi.fn(),
  removeFighterActionCmd: vi.fn(),
}));

vi.mock('@/actions/websockets/clientCommands.js', () => ({
  removeFighterActionCmd: (...args) => removeFighterActionCmd(...args),
}));

vi.mock('@/data/fighterActions.js', () => ({
  default: {
    getState: () => ({removeAction}),
  },
}));

describe('stopIdle', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('removes idle training and sends a stop fighter action command', () => {
    stopIdle({skillKey: 'begging'});

    expect(removeAction).toHaveBeenCalledWith(SKILL_IDS.begging);
    expect(removeFighterActionCmd).toHaveBeenCalledWith(SKILL_IDS.begging);
  });

  it('does not remove or send a command when the skill id is invalid', () => {
    stopIdle({skillKey: 'invalid'});

    expect(removeAction).not.toHaveBeenCalled();
    expect(removeFighterActionCmd).not.toHaveBeenCalled();
  });
});
