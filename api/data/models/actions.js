import {generateCrudModel} from '../utils/crud.js';


export default function actions(db) {
  return generateCrudModel(db, 'actions', {listOrderBy: 'name'});
}
