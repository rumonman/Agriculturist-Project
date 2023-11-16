import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    USER_LOADED,
    ALLUSER_LOADED,
    DELETE_USER,
    ADD_CSS_CLASS
  } from '../actions/types';
  
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: true,
    isSearch: false,
    user: null,
    allUsers: [],
    searchUser: null,
    isAddClass: false
  };
  
  export default  function authReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
      case ADD_CSS_CLASS:
          return {
            ...state,
            loading: false,
            isAddClass: payload 
          };
      case USER_LOADED:
          return {
            ...state,
            isAuthenticated: true,
            loading: false,
            isSearch: false,
            user: payload
          };
      case ALLUSER_LOADED:
        return {
          ...state,
          loading: false,
          allUsers: payload
        };
      case REGISTER_SUCCESS:
          return {
            ...state,
            ...payload,
            isAuthenticated: true,
            loading: false
          };
      case LOGIN_SUCCESS:
          localStorage.setItem('token', payload.token)
            return {
              ...state,
              ...payload,
              isAuthenticated: true,
              loading: false
            };
      case REGISTER_FAIL:
      case AUTH_ERROR:
      case LOGIN_FAIL:
            localStorage.removeItem('token');
          return {
            ...state,
            token: null,
            isAuthenticated: false,
            loading: false,
            isSuccess: false
          };
      case LOGOUT:
        localStorage.removeItem('token');
        return {
          ...state,
          token: null,
          isAuthenticated: false,
          loading: false,
          user: null
        };
      case DELETE_USER:
          return {
            ...state,
            allUsers: state.allUsers.filter((user) => user._id.$oid !== payload),
            loading: false
          };
      default:
        return state;
    }
  }
 