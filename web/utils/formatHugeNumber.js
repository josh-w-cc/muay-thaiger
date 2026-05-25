export default function formatHugeNumber(value) {
  if(isPositiveIntegerNumber(value)) {
    return formatNumber(value);
  }

  if(isPositiveIntegerString(value)) {
    return formatIntegerString(value);
  }

  return value;
}

function isPositiveIntegerNumber(value) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

function isPositiveIntegerString(value) {
  return typeof value === 'string' && /^\+?\d+$/.test(value);
}

function formatIntegerString(value) {
  const digits = value.replace(/^\+/, '').replace(/^0+/, '') || '0';

  if(digits.length <= 5) {
    return digits;
  }

  return `${digits[0]}.${digits.slice(1, 3).padEnd(2, '0')}e${digits.length - 1}`;
}

function formatNumber(value) {
  if(Math.abs(value) > 99999) {
    return value.toExponential(2).replace('e+', 'e');
  }

  return value;
}
