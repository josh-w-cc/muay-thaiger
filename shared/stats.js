export function parseBigIntStats(stats) {
  if(!stats || typeof stats !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [key, toBigIntOrZero(value)]),
  );
}

function toBigIntOrZero(value) {
  try {
    return BigInt(value ?? 0);
  }
  catch {
    return 0n;
  }
}
