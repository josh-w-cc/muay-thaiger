import {SKILL_IDS} from 'shared/skills/ids.js';

import getActionIDBySkillKey from './getActionIDBySkillKey.js';


describe('getActionIDBySkillKey', () => {
  it('returns the action id for a valid skill key', () => {
    expect(getActionIDBySkillKey('begging')).toBe(SKILL_IDS.begging);
  });

  it('returns null for an invalid skill key', () => {
    expect(getActionIDBySkillKey('invalid')).toBeNull();
  });
});
