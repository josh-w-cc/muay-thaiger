import {formatGold, formatGoldStat, getFightBet, parseGold} from './gold.js';


describe('gold utilities', () => {
  it('parses valid whole-number gold values as BigInt', () => {
    expect(parseGold(250)).toBe(250n);
    expect(parseGold('250')).toBe(250n);
    expect(parseGold(250n)).toBe(250n);
  });

  it('falls back to zero for invalid gold values', () => {
    expect(parseGold('not-a-number')).toBe(0n);
    expect(parseGold(-1)).toBe(0n);
  });

  it('formats gold with cents until the baht amount gets large', () => {
    expect(formatGold(199n)).toBe('1.99');
    expect(formatGold(1000099n)).toBe('10000');
    expect(formatGold('12345678901234567890')).toBe('1.23e17');
  });

  it('formats gold stats without forced trailing zeroes', () => {
    expect(formatGoldStat(2100n)).toBe('21');
    expect(formatGoldStat(2199n)).toBe('21.99');
  });

  it('calculates fight bets with BigInt arithmetic', () => {
    expect(getFightBet('9007199254740993', 1)).toBe(900719925474099n);
    expect(getFightBet(50n, 0)).toBe(100n);
  });
});
