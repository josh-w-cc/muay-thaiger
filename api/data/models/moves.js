import {generateCrudModel} from '../utils/crud.js';


export default function moves(db) {
  return generateCrudModel(db, 'moves', 'name');
}
