import {generateCrudModel} from '../utils/crud.js';


export default function events(db) {
  return generateCrudModel(db, 'events', {listOrderBy: 'created_at', update: false});
}
