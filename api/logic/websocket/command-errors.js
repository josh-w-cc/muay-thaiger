export function createCommandError(code) {
  return Object.assign(new Error(code), {code});
}
