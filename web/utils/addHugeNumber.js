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
  let leftIndex = left.length - 1;
  let rightIndex = right.length - 1;
  let sum = '';

  while(leftIndex >= 0 || rightIndex >= 0 || carry > 0) {
    const leftDigit = leftIndex >= 0 ? Number(left[leftIndex]) : 0;
    const rightDigit = rightIndex >= 0 ? Number(right[rightIndex]) : 0;
    const nextDigit = leftDigit + rightDigit + carry;

    sum = `${nextDigit % 10}${sum}`;
    carry = Math.floor(nextDigit / 10);
    leftIndex -= 1;
    rightIndex -= 1;
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
