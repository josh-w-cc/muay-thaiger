export default function formatHugeNumber(value) {
  if(typeof value === 'number' && Number.isFinite(value)) {
    return formatNumber(value);
  }

  if(typeof value === 'string' && /^[-+]?\d+$/.test(value)) {
    return formatIntegerString(value);
  }

  return value;
}

const DECIMAL_END_INDEX = 3;
const DECIMAL_START_INDEX = 1;
const SIGNIFICANT_DECIMAL_DIGITS = 2;


function formatIntegerString(value) {
  const isNegative = value.startsWith('-');
  const unsignedDigits = value.replace(/^[-+]/, '');
  const trimmedDigits = unsignedDigits.replace(/^0+/, '') || '0';

  if(trimmedDigits.length <= 5) {
    const sign = isNegative && trimmedDigits !== '0' ? '-' : '';

    return `${sign}${trimmedDigits}`;
  }

  const exponent = trimmedDigits.length - 1;
  const whole = trimmedDigits[0];
  const decimal = trimmedDigits
    .slice(DECIMAL_START_INDEX, DECIMAL_END_INDEX)
    .padEnd(SIGNIFICANT_DECIMAL_DIGITS, '0');
  const sign = isNegative ? '-' : '';

  return `${sign}${whole}.${decimal}e+${exponent}`;
}

function formatNumber(value) {
  if(Math.abs(value) > 99999) {
    return value.toExponential(2);
  }

  return value;
}
