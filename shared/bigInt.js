export default function patchBigIntPrototype() {
  defineMethod('logApprox', logApprox);
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
    writable: false,
  });
}

function logApprox() {
  const digits = this < 0n ? (-this).toString() : this.toString();
  return BigInt(digits === '0' ? 0 : digits.length);
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

patchBigIntPrototype();
