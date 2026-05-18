export default function formatHugeNumber(value) {
  if(typeof value !== 'number' || !Number.isFinite(value)) {
    return value;
  }

  if(Math.abs(value) > 99999) {
    return value.toExponential(2);
  }

  return value;
}
