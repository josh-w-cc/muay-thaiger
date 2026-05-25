export function normalizeFighter(fighter) {
  if(!fighter) {
    return fighter;
  }

  const normalizedFighter = {...fighter};
  const gold = parseWholeBigInt(fighter.gold);

  if(gold !== null) {
    normalizedFighter.gold = gold;
  }
  if(fighter.stats) {
    normalizedFighter.stats = normalizeFighterStats(fighter.stats);
  }
  return normalizedFighter;
}

export function normalizeFighterStats(stats = {}) {
  if(!stats || typeof stats !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(stats).flatMap(([key, value]) => {
      const statValue = parseWholeBigInt(value);
      if(statValue === null) {
        return [];
      }
      return [[key, statValue]];
    }),
  );
}

export function parseWholeBigInt(value) {
  if(isWholeBigInt(value)) {
    return value;
  }
  if(isWholeNumber(value)) {
    return BigInt(value);
  }
  if(isWholeNumberString(value)) {
    return BigInt(value);
  }
  return null;
}

export function toSafeNumber(value) {
  const finiteNumber = getFiniteNumber(value);

  if(finiteNumber !== null) {
    return finiteNumber;
  }

  const wholeNumber = parseWholeBigInt(value);
  if(wholeNumber === null) {
    return 0;
  }

  const number = Number(wholeNumber);
  if(Number.isFinite(number)) {
    return number;
  }

  const approximateNumber = getApproximateNumber(wholeNumber);

  if(Number.isFinite(approximateNumber)) {
    return approximateNumber;
  }

  return Number.MAX_VALUE;
}

function getApproximateNumber(value) {
  const digits = value.toString();

  return Number.parseFloat(`${digits[0]}.${digits.slice(1, 16)}e${digits.length - 1}`);
}

function getFiniteNumber(value) {
  if(typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  return null;
}

function isWholeBigInt(value) {
  return typeof value === 'bigint' && value >= 0n;
}

function isWholeNumber(value) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isWholeNumberString(value) {
  return typeof value === 'string' && /^\+?\d+$/.test(value);
}
