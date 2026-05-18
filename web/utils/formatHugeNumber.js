export default function formatHugeNumber(value) {
  if(typeof value === 'number' && Number.isFinite(value)) {
    return formatNumber(value);
  }

  if(typeof value === 'string' && /^[-+]?\d+$/.test(value)) {
    return formatIntegerString(value);
  }

  return value;
}

function formatIntegerString(value) {
  const isNegative = value.startsWith('-');
  const digits = value.replace(/^[-+]/, '').replace(/^0+/, '') || '0';

  if(digits.length <= 5) {
    return `${getNegativeSign(isNegative, digits)}${digits}`;
  }

  const sign = isNegative ? '-' : '';
  return `${sign}${digits[0]}.${digits.slice(1, 3).padEnd(2, '0')}e+${digits.length - 1}`;
}

function getNegativeSign(isNegative, digits) {
  return isNegative && digits !== '0' ? '-' : '';
}

function formatNumber(value) {
  if(Math.abs(value) > 99999) {
    return value.toExponential(2);
  }

  return value;
}
