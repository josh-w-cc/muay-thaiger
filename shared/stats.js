export function parseBigIntStats(stats) {
  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [key, BigInt(value ?? 0)]),
  );
}
