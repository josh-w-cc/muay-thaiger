patchBigIntPrototype();

export default function patchBigIntPrototype() {
  defineMethod('toFormattedNumber', toFormattedNumber);
  defineMethod('toJSON', toJSON);
}

function defineMethod(name, value) {
  if(Object.hasOwn(BigInt.prototype, name)) {
    return;
  }

  Object.defineProperty(BigInt.prototype, name, {
    configurable: true,
    value,
    writable: true,
  });
}

function toFormattedNumber() {
  const digits = this.toString();

  if(digits.length <= 5) {
    return digits;
  }

  return `${digits[0]}.${digits.slice(1, 3).padEnd(2, '0')}e${digits.length - 1}`;
}

function toJSON() {
  return this.toString();
}
