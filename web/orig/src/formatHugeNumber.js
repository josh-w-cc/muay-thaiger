export default function formatHugeNumber(value) {
  if(typeof value === 'number' && Number.isFinite(value)) {
    return formatNumber(value);
  }

  if(typeof value === 'string' && /^[-+]?\d+$/.test(value)) {
    return formatIntegerString(value);
  }

  return value;
}

const DECIMAL_DIGIT_END = 3;
const DECIMAL_DIGIT_START = 1;
const MAX_UNFORMATTED_DIGITS = 5;
const SIGNIFICANT_DECIMAL_DIGITS = 2;


function formatIntegerString(value) {
  const isNegative = value.startsWith('-');
  const unsignedDigits = value.replace(/^[-+]/, '');
  const trimmedDigits = unsignedDigits.replace(/^0+/, '') || '0';

  if(trimmedDigits.length <= MAX_UNFORMATTED_DIGITS) {
    const sign = isNegative && trimmedDigits !== '0' ? '-' : '';

    return `${sign}${trimmedDigits}`;
  }

  const exponent = trimmedDigits.length - 1;
  const whole = trimmedDigits[0];
  const decimal = trimmedDigits
    .slice(DECIMAL_DIGIT_START, DECIMAL_DIGIT_END)
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
