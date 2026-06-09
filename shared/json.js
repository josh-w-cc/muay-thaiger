export function parseJSON(raw) {
  try {
    return JSON.parse(raw);
  }
  catch {
    return null;
  }
}
