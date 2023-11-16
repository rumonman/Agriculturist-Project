import { combineReducers } from 'redux';

import auth from './auth';
import post from './post';
import alert from './alert';
import file from './file';
import friend from './friends';
export default combineReducers({
  auth,
  post,
  file,
  alert,
  friend
});