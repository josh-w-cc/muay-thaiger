export default function statics(db) {
  return {
    listRace: () => db('races').orderBy('name'),
  };
}
