import {generateCrudModel} from '../utils/crud.js';


export default function players(db) {
  return {
    ...generateCrudModel(db, 'players', {listOrderBy: 'display_name'}),
    findByToken: (token) => db('players').where({token}).first(),
  };
}
