import SnowLeopardMuayThaiReady from '../assets/SnowLeopardMuayThaiReady.png';
import SnowLeopardMuayThaiPunch from '../assets/SnowLeopardMuayThaiPunch.png';
import TigerMuayThai from '../assets/TigerMuayThai.png';
import TigerPunch from '../assets/TigerPunch.png';

const RACE_FIGHT_IMAGES = {1: TigerMuayThai, 2: SnowLeopardMuayThaiReady};
const RACE_PUNCH_IMAGES = {1: TigerPunch, 2: SnowLeopardMuayThaiPunch};
const RACE_DISPLAY_NAMES = {1: 'Tiger', 2: 'Snow leopard'};

export function buildCard(participant) {
  const raceName = RACE_DISPLAY_NAMES[participant.race];
  const hp = getHealthBar(raceName, participant);
  const stamina = getStaminaBar(raceName, participant);
  return {
    alt: formatAltText(raceName),
    attack: participant.stats.attack,
    defense: participant.stats.defense,
    hp,
    punchSrc: RACE_PUNCH_IMAGES[participant.race],
    src: RACE_FIGHT_IMAGES[participant.race],
    stamina,
  };
}

export function formatCombatStat(value) {
  return value.toFormattedNumber();
}

function getHealthBar(raceName, participant) {
  return {
    current: participant.stats.health,
    label: formatStatLabel(raceName, 'health'),
    max: participant.startingStats.health,
  };
}

function getStaminaBar(raceName, participant) {
  return {
    current: participant.stats.stamina,
    label: formatStatLabel(raceName, 'stamina'),
    max: participant.startingStats.stamina,
  };
}

function formatAltText(raceName) {
  return `${raceName} Muay Thai fighter`;
}

function formatStatLabel(raceName, statName) {
  return `${raceName} fighter ${statName}`;
}
