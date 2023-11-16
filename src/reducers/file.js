import {
    GET_FILE,
    FILE_ERROR,
    DELETE_FILE,
    ADD_FILE,
    ADD_ADV,
    GET_ADV,
    ADV_ERROR,
    DELETE_ADV
  } from '../actions/types';
  
  const initialState = {
    files: [],
    loading: true,
    advertise:[],
    isSuccess: false,
    error: {}
  };
  
  function fileReducer(state = initialState, action) {
    const { type, payload } = action;
    
    switch (type) {
      case GET_FILE:
        return {
          ...state,
          files: payload,
          loading: false,
          isSuccess: false
        };
      case ADD_FILE:
        return {
          ...state,
          loading: false,
          isSuccess: true
        };
      case DELETE_FILE:
        return {
          ...state,
          files: state.files.filter((file) => file._id.$oid !== payload),
          loading: false
        };
      case FILE_ERROR:
        return {
          ...state,
          error: payload,
          files:[],
          loading: false,
          isSuccess: false
        };
      case GET_ADV:
        return {
          ...state,
          advertise: payload,
          loading: false,
          isSuccess: false
        };
      case ADD_ADV:
        return {
          ...state,
          loading: false,
          isSuccess: true
        };
      case ADV_ERROR:
        return {
          ...state,
          error: payload,
          advertise:[],
          loading: false,
          isSuccess: false
        };
      case DELETE_ADV:
        return {
          ...state,
          advertise: state.advertise.filter((adv) => adv._id.$oid !== payload),
          loading: false
        };
      default:
        return state;
    }
  }
  export default fileReducer;