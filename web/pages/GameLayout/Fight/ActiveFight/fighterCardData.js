import SnowLeopardMuayThaiReady from '../assets/SnowLeopardMuayThaiReady.png';
import TigerMuayThai from '../assets/TigerMuayThai.png';

const RACE_FIGHT_IMAGES = {1: TigerMuayThai, 2: SnowLeopardMuayThaiReady};
const RACE_DISPLAY_NAMES = {1: 'Tiger', 2: 'Snow leopard'};

export function buildCard(participant) {
  const participantData = participant || {};
  const raceName = getRaceName(participantData.race);
  const calculatedStats = participantData.calculatedStats || {};
  const stats = participantData.stats || {};
  const startingStats = participantData.startingStats || {};
  const hp = getHealthBar(raceName, stats, calculatedStats, startingStats);
  const stamina = getStaminaBar(raceName, stats, startingStats);
  return {
    alt: formatAltText(raceName),
    attack: getCombatStat(calculatedStats.attack),
    defense: getCombatStat(calculatedStats.defense),
    hp,
    src: getRaceImage(participantData.race),
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

function getHealthBar(raceName, stats, calculatedStats, startingStats) {
  const current = getCurrentValue(stats.health, calculatedStats.health, 0);
  return {
    current,
    label: formatStatLabel(raceName, 'health'),
    max: getMaxValue(startingStats.health, 0, current),
  };
}

function getStaminaBar(raceName, stats, startingStats) {
  const current = getCurrentValue(stats.stamina, undefined, 0);
  return {
    current,
    label: formatStatLabel(raceName, 'stamina'),
    max: getMaxValue(startingStats.stamina, 0, current),
  };
}

function getMaxValue(value, fallbackValue, currentValue) {
  return Math.max(toNumber(value, fallbackValue), currentValue, 1);
}

function getRaceName(raceID) {
  return RACE_DISPLAY_NAMES[raceID];
}

function getRaceImage(raceID) {
  return RACE_FIGHT_IMAGES[raceID];
}

function formatAltText(raceName) {
  return raceName ? `${raceName} Muay Thai fighter` : 'Muay Thai fighter';
}

function formatStatLabel(raceName, statName) {
  return raceName ? `${raceName} fighter ${statName}` : `Fighter ${statName}`;
}

function getCombatStat(value) {
  return value ?? 0n;
}

function toNumber(value, fallbackValue = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
}
