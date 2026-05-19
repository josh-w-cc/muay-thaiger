export default function races(db) {
  return {
    list: () => db('races').orderBy('name'),
  };
}
