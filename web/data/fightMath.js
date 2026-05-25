const RISK_PERCENTAGES = [
  {denominator: 1000n, numerator: 1n},
  {denominator: 10n, numerator: 1n},
  {denominator: 4n, numerator: 1n},
  {denominator: 2n, numerator: 1n},
  {denominator: 1n, numerator: 1n},
];

export function calculateBet(fighter, risk) {
  const selectedRisk = RISK_PERCENTAGES[risk] || RISK_PERCENTAGES[1];
  const fighterGold = BigInt(fighter.gold);
  const calculatedBet = fighterGold * selectedRisk.numerator / selectedRisk.denominator;
  return calculatedBet < 100n ? 100n : calculatedBet;
}

export function createEnemyStats(bet) {
  const betAsDouble = Number(bet);
  return {
    apm: Math.max(4, Math.log(betAsDouble)) * (Math.random() + 0.5),
    attack: Math.sqrt(betAsDouble) * (Math.random() + 0.5),
    defense: Math.sqrt(betAsDouble) * (Math.random() + 0.5),
    health: betAsDouble * 10 * (Math.random() + 0.5),
    power: betAsDouble * (Math.random() + 0.5),
    stamina: betAsDouble * Math.sqrt(betAsDouble) * (Math.random() + 0.5),
  };
}
