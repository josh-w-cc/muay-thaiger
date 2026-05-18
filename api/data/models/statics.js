export default function statics(db) {
  return {
    listRace: () => db('statics').where({type: 'race'}).orderBy('name'),
  };
}
