export default function addHugeNumber(value, addend) {
  if(!isIntegerString(value)) {
    return value;
  }

  const normalizedAddend = normalizeAddend(addend);

  if(normalizedAddend === null) {
    return value;
  }

  return (BigInt(value) + normalizedAddend).toString();
}

function isIntegerString(value) {
  return typeof value === 'string' && /^\+?\d+$/.test(value);
}

function normalizeAddend(value) {
  if(isNonNegativeBigInt(value)) {
    return value;
  }

  if(isNonNegativeSafeInteger(value)) {
    return BigInt(value);
  }

  if(isIntegerString(value)) {
    return BigInt(value);
  }

  return null;
}

function isNonNegativeBigInt(value) {
  return typeof value === 'bigint' && value >= 0n;
}

function isNonNegativeSafeInteger(value) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
