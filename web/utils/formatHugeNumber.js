export default function formatHugeNumber(value) {
  if(typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return formatNumber(value);
  }

  if(typeof value === 'string' && /^\+?\d+$/.test(value)) {
    return formatIntegerString(value);
  }

  return value;
}

function formatIntegerString(value) {
  const digits = value.replace(/^\+/, '').replace(/^0+/, '') || '0';

  if(digits.length <= 5) {
    return digits;
  }

  return `${digits[0]}.${digits.slice(1, 3).padEnd(2, '0')}e+${digits.length - 1}`;
}

function formatNumber(value) {
  if(Math.abs(value) > 99999) {
    return value.toExponential(2);
  }

  return value;
}
