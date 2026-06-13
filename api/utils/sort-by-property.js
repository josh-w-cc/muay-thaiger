export function sortByProperty(items, property) {
  return items.toSorted((left, right) => compareByProperty(left, right, property));
}

function compareByProperty(left, right, property) {
  const leftValue = left[property];
  const rightValue = right[property];
  if(leftValue === rightValue) {
    return 0;
  }
  if(leftValue == null) {
    return 1;
  }
  if(rightValue == null) {
    return -1;
  }
  return leftValue > rightValue ? 1 : -1;
}
