import formatHugeNumber from './formatHugeNumber.js';


const MINIMUM_FIGHT_BET = 100n;
const SATANG_PER_BAHT = 100n;
const GOLD_PARSERS = {
  bigint: (gold) => gold >= 0n ? gold : null,
  number: (gold) => Number.isInteger(gold) && gold >= 0 ? BigInt(gold) : null,
  string: (gold) => /^\d+$/.test(gold) ? BigInt(gold) : null,
};
const RISK_PERCENTAGES = [
  {denominator: 1000n, numerator: 1n},
  {denominator: 10n, numerator: 1n},
  {denominator: 4n, numerator: 1n},
  {denominator: 2n, numerator: 1n},
  {denominator: 1n, numerator: 1n},
];


export function formatGold(gold) {
  const baht = getBaht(gold);

  if(baht < 10000n) {
    return `${baht}.${getSatang(gold)}`;
  }

  return formatHugeNumber(baht);
}

export function formatGoldStat(gold) {
  const wholeGold = parseGold(gold);

  if(wholeGold < 1000000n && wholeGold % SATANG_PER_BAHT) {
    return `${getBaht(wholeGold)}.${getSatang(wholeGold)}`;
  }

  return formatHugeNumber(getBaht(wholeGold));
}

export function getFightBet(gold, risk) {
  const wholeGold = parseGold(gold);
  const riskPercentage = RISK_PERCENTAGES[risk] ?? RISK_PERCENTAGES[0];
  const bet = wholeGold * riskPercentage.numerator / riskPercentage.denominator;

  if(bet > MINIMUM_FIGHT_BET) {
    return bet;
  }

  return MINIMUM_FIGHT_BET;
}

export function parseGold(gold) {
  const parsedGold = getParsedGold(gold);

  if(parsedGold !== null) {
    return parsedGold;
  }

  return 0n;
}

function getParsedGold(gold) {
  return GOLD_PARSERS[typeof gold]?.(gold) ?? null;
}

function getBaht(gold) {
  return parseGold(gold) / SATANG_PER_BAHT;
}

function getSatang(gold) {
  return `${parseGold(gold) % SATANG_PER_BAHT}`.padStart(2, '0');
}
