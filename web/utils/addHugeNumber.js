export default function addHugeNumber(value, addend) {
  if(!isIntegerString(value)) {
    return value;
  }

  const normalizedAddend = normalizeAddend(addend);

  if(normalizedAddend === null) {
    return value;
  }

  return addIntegerStrings(normalizeIntegerString(value), normalizedAddend);
}

function addIntegerStrings(left, right) {
  let carry = 0;
  let sum = '';
  const maxLength = Math.max(left.length, right.length);

  for(let digitPosition = 0; digitPosition < maxLength; digitPosition += 1) {
    const addendValue = toDigit(right, right.length - 1 - digitPosition);
    const baseValue = toDigit(left, left.length - 1 - digitPosition);
    const nextDigit = baseValue + addendValue + carry;

    sum = `${nextDigit % 10}${sum}`;
    carry = Math.floor(nextDigit / 10);
  }

  if(carry > 0) {
    return `${carry}${sum}`;
  }

  return sum;
}

function isIntegerString(value) {
  return typeof value === 'string' && /^\+?\d+$/.test(value);
}

function normalizeAddend(value) {
  if(typeof value === 'number' && Number.isSafeInteger(value) && value >= 0) {
    return `${value}`;
  }

  if(isIntegerString(value)) {
    return normalizeIntegerString(value);
  }

  return null;
}

function normalizeIntegerString(value) {
  return value.replace(/^\+/, '').replace(/^0+/, '') || '0';
}

function toDigit(value, index) {
  if(index < 0) {
    return 0;
  }

  return Number(value[index]);
}
