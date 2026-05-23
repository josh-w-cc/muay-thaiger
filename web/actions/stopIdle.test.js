import {SKILL_IDS} from 'shared/skills.js';

import stopIdle from './stopIdle.js';


const {removeAction, removeFighterActionCmd, setState} = vi.hoisted(() => ({
  removeAction: vi.fn(),
  removeFighterActionCmd: vi.fn(),
  setState: vi.fn(),
}));

vi.mock('@/actions/websockets/index.js', () => ({
  removeFighterActionCmd: (...args) => removeFighterActionCmd(...args),
}));

vi.mock('@/data/fighterActions.js', () => ({
  default: {
    getState: () => ({removeAction}),
  },
}));

vi.mock('@/data/fighter.js', () => ({
  default: {
    getState: () => ({idling: {key: 'train-begging'}}),
    setState: (...args) => setState(...args),
  },
}));

describe('stopIdle', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('removes idle training and sends a stop fighter action command', () => {
    stopIdle({skillKey: 'begging'});

    expect(removeAction).toHaveBeenCalledWith(SKILL_IDS.begging);
    expect(setState).toHaveBeenCalledWith({idling: false});
    expect(removeFighterActionCmd).toHaveBeenCalledWith(SKILL_IDS.begging);
  });

  it('does not remove or send a command when the skill id is invalid', () => {
    stopIdle({skillKey: 'invalid'});

    expect(removeAction).not.toHaveBeenCalled();
    expect(setState).not.toHaveBeenCalled();
    expect(removeFighterActionCmd).not.toHaveBeenCalled();
  });
});
