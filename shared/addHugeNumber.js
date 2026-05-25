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
  if(typeof value === 'bigint' && value >= 0n) {
    return value;
  }

  if(typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) {
    return BigInt(value);
  }

  if(isIntegerString(value)) {
    return BigInt(value);
  }

  return null;
}
