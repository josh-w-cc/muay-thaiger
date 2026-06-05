import SnowLeopardMuayThaiReady from '../assets/SnowLeopardMuayThaiReady.png';
import TigerMuayThai from '../assets/TigerMuayThai.png';

const RACE_FIGHT_IMAGES = {1: TigerMuayThai, 2: SnowLeopardMuayThaiReady};
const RACE_DISPLAY_NAMES = {1: 'Tiger', 2: 'Snow leopard'};

export function buildCard(participant) {
  const raceName = getRaceName(participant.race);
  const hp = getHealthBar(raceName, participant);
  const stamina = getStaminaBar(raceName, participant);
  return {
    alt: formatAltText(raceName),
    attack: participant.calculatedStats.attack,
    defense: participant.calculatedStats.defense,
    hp,
    src: getRaceImage(participant.race),
    stamina,
  };
}

export function formatCombatStat(value) {
  return BigInt(value).toFormattedNumber();
}

function getHealthBar(raceName, participant) {
  const current = toNumber(participant.stats.health);
  return {
    current,
    label: formatStatLabel(raceName, 'health'),
    max: getMaxValue(participant.startingStats.health, current),
  };
}

function getStaminaBar(raceName, participant) {
  const current = toNumber(participant.stats.stamina);
  return {
    current,
    label: formatStatLabel(raceName, 'stamina'),
    max: getMaxValue(participant.startingStats.stamina, current),
  };
}

function getMaxValue(maxValue, currentValue) {
  return Math.max(toNumber(maxValue), currentValue, 1);
}

function getRaceName(raceID) {
  return RACE_DISPLAY_NAMES[raceID];
}

function getRaceImage(raceID) {
  return RACE_FIGHT_IMAGES[raceID];
}

function formatAltText(raceName) {
  return `${raceName} Muay Thai fighter`;
}

function formatStatLabel(raceName, statName) {
  return `${raceName} fighter ${statName}`;
}

function toNumber(value) {
  return Number(value);
}
