import {SKILLS_BY_ACTION_ID} from 'shared/skills/index.js';
import trainStat from 'shared/trainingStat.js';
import {sortByProperty} from '#api/utils/sort-by-property.js';

export default function train(fighter, now = new Date()) {
  const enabledSkills = fighter.details.regimen.filter((s) => s.enabled);
  if(!enabledSkills.length) {
    return fighter;
  }
  const sFighter = structuredClone(fighter);
  const skillsUsed = determineSkillsUsed(enabledSkills, now.getTime());
  const {gold, stats} = calculateTraining(sFighter.details.stats, skillsUsed, sFighter.details.gold);
  return updatedFighter(sFighter, skillsUsed, stats, gold);
}

function calculateTraining(stats, skills, gold) {
  const fighterProxy = {
    train: (stat, amount = 1n) => trainStat(stats, stat, amount),
    win: (g) => { gold += g; },
  };
  for(const skill of skills) {
    SKILLS_BY_ACTION_ID[skill.id].action(fighterProxy);
  }
  return {gold: gold, stats: stats};
}

function determineSkillsUsed(enabledSkills, now) {
  const skills = sortByProperty(enabledSkills, 'lastUsed');
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
  const unchangedSkills = fighter.details.regimen.filter((s) => !skillIDs.includes(s.id));
  const updatedSkills = [...new Set(skills)];
  const updatedRegimen = [...unchangedSkills, ...updatedSkills];
  return {
    ...fighter,
    details: {
      ...fighter.details,
      gold,
      regimen: updatedRegimen,
      stats,
    },
  };
}
