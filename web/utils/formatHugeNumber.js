import 'shared/bigInt.js';


export default function formatHugeNumber(value) {
  if(typeof value === 'number') {
    return formatNumber(value);
  }

  const wholeNumber = parseWholeNumber(value);

  if(wholeNumber !== null) {
    return wholeNumber.toFormattedNumber();
  }

  return value;
}

function formatNumber(value) {
  if(!Number.isInteger(value) || value <= 0 || value <= 99999) {
    return value;
  }

  return BigInt(value).toFormattedNumber();
}

function parseWholeNumber(value) {
  if(typeof value === 'bigint' && value >= 0n) {
    return value;
  }

  if(typeof value !== 'string' || !/^\+?\d+$/.test(value)) {
    return null;
  }

  return BigInt(value);
}
