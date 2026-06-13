import {SKILLS_BY_ACTION_ID} from 'shared/skills/index.js';
import trainStat from 'shared/trainingStat.js';
import {sortByProperty} from '#api/utils/sort-by-property.js';

export default function train(fighter, now = new Date()) {
  const skills = determineSkillsUsed(fighter.details.regimen, now.getTime());
  const {gold, stats} = calculateTraining(fighter.details.stats, skills);
  return updatedFighter(fighter, skills, stats, gold);
}


function calculateTraining(stats, skills, gold) {
  const newStats = structuredClone(stats);
  let newGold = gold;
  const fighterProxy = {
    train: (stat, amount) => {
      newStats[stats] = trainStat(newStats, stat, amount);
    },
    win: (g) => newGold += g,
  };
  for(const skill of skills) {
    SKILLS_BY_ACTION_ID[skill.id].action(fighterProxy);
  }
  return {stats: newStats, gold: newGold};
}


function determineSkillsUsed(regimen, now) {
  const skills = sortByProperty(structuredClone(regimen.filter((s) => s.enabled)), 'lastUsed');
  let current = skills[skills.length - 1].lastUsed;
  const skillsUsed = [];
  while(current < now) {
    const next = skills.shift();
    current += SKILLS_BY_ACTION_ID[next.id].duration * 1000;
    skills.push(next);
    if(current < now) {
      skillsUsed.push(next);
      next.lastUsed = current;
    }
  }
  return skillsUsed;
}

function updatedFighter(fighter, skills, stats, gold) {
  const skillIDs = skills.map((s) => s.id);
  const updatedRegimen = fighter.details.regimen.filter((s) => !skillIDs.some(s.id));
  updatedRegimen.push(...skills);
  return {
    ...fighter,
    details: {
      gold,
      ...fighter.details,
      regimen: updatedRegimen,
      stats: {
        ...stats,
      },
    },
  };
}
