import {RACES} from 'shared/races.js';

import SnowLeopardMuayThaiReady from '../assets/SnowLeopardMuayThaiReady.png';
import TigerMuayThai from '../assets/TigerMuayThai.png';

const RACE_FIGHT_IMAGES = {1: TigerMuayThai, 2: SnowLeopardMuayThaiReady};
const RACE_DISPLAY_NAMES = Object.fromEntries(RACES.map((race) => [race.id, race.name.replace('Leopard', 'leopard')]));

export function buildCard(participant, defaults) {
  const participantData = participant || {};
  const raceName = getRaceName(participantData.race);
  const calculatedStats = participantData.calculatedStats || {};
  const stats = participantData.stats || {};
  const startingStats = participantData.startingStats || {};
  const hp = getHealthBar(raceName, stats, calculatedStats, startingStats, defaults.hp);
  const stamina = getStaminaBar(raceName, stats, startingStats, defaults.stamina);
  return {
    ...defaults,
    alt: formatAltText(raceName, defaults.alt),
    attack: getCombatStat(calculatedStats.attack, defaults.attack),
    defense: getCombatStat(calculatedStats.defense, defaults.defense),
    hp,
    src: getRaceImage(participantData.race, defaults.src),
    stamina,
  };
}

export function formatCombatStat(value) {
  const normalizedValue = typeof value === 'bigint' ? value : BigInt(value || 0);
  return normalizedValue.toFormattedNumber();
}

function getCurrentValue(primaryValue, secondaryValue, fallbackValue) {
  const primary = toNumber(primaryValue, null);
  if(primary !== null) {
    return primary;
  }
  const secondary = toNumber(secondaryValue, null);
  if(secondary !== null) {
    return secondary;
  }
  return fallbackValue;
}

function getHealthBar(raceName, stats, calculatedStats, startingStats, defaults) {
  const current = getCurrentValue(stats.health, calculatedStats.health, defaults.current);
  return {
    current,
    label: formatStatLabel(raceName, 'health', defaults.label),
    max: getMaxValue(startingStats.health, defaults.max, current),
  };
}

function getStaminaBar(raceName, stats, startingStats, defaults) {
  const current = getCurrentValue(stats.stamina, undefined, defaults.current);
  return {
    current,
    label: formatStatLabel(raceName, 'stamina', defaults.label),
    max: getMaxValue(startingStats.stamina, defaults.max, current),
  };
}

function getMaxValue(value, fallbackValue, currentValue) {
  return Math.max(toNumber(value, fallbackValue), currentValue, 1);
}

function getRaceName(raceID) {
  return RACE_DISPLAY_NAMES[raceID];
}

function getRaceImage(raceID, fallback) {
  return RACE_FIGHT_IMAGES[raceID] || fallback;
}

function formatAltText(raceName, fallback) {
  return raceName ? `${raceName} Muay Thai fighter` : fallback;
}

function formatStatLabel(raceName, statName, fallback) {
  return raceName ? `${raceName} fighter ${statName}` : fallback;
}

function getCombatStat(value, fallback) {
  return value || fallback;
}

function toNumber(value, fallbackValue = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
}
