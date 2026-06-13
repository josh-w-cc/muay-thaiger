import {SKILLS_BY_ACTION_ID} from 'shared/skills/index.js';
import trainStat from 'shared/trainingStat.js';
import {sortByProperty} from '#api/utils/sort-by-property.js';

export default function train(fighter, now = new Date()) {
  const skills = determineSkillsUsed(fighter.details.regimen, now.getTime());
  const stats = calculateTraining(fighter.details.stats, skills);
  return updatedFighter(fighter, skills, stats);
}


function calculateTraining(stats, skills) {
  const newStats = structuredClone(stats);
  const fighterProxy = {
    train: (stat, amount) => {
      newStats[stats] = trainStat(newStats, stat, amount);
    },
    win: (g) => newStats.gold += g,
  };
  for(const skill of skills) {
    SKILLS_BY_ACTION_ID[skill.id].action(fighterProxy);
  }
  return newStats;
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

function updatedFighter(fighter, skills, stats) {
  const skillIDs = skills.map((s) => s.id);
  const updatedRegimen = fighter.details.regimen.filter((s) => !skillIDs.some(s.id));
  return {
    ...fighter,
    details: {
      ...fighter.details,
      regimen: updatedRegimen,
      stats: {
        ...stats,
      },
    },
  };
}
