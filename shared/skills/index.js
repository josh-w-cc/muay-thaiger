import {createSeedEntries} from '../seedData.js';
import {SKILL_DEFINITIONS} from './definitions.js';
import {SKILL_IDS} from './ids.js';

export {SKILL_DEFINITIONS, SKILL_IDS};

export const SKILLS_BY_ACTION_ID = Object.freeze(Object.fromEntries(Object.entries(SKILL_IDS).map(([key, id]) => [id, SKILL_DEFINITIONS[key]])));

export const SKILL_SEED_ACTIONS = createSeedEntries(SKILL_DEFINITIONS, SKILL_IDS, () => ({type: 'train'}));
