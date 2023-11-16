import {
    ADD_FRIEND,
    REMOVE_FRIEND,
    CANCEL_REQUEST,
    DELETE_REQUEST,
    ACCEPT_REQUEST,
    ERROR_REQUEST,
    GET_PENDINGFRIEND,
    GET_MYFRIEND,
    GET_FRIENDSUGGESTION
} from '../actions/types';
const initialState = {
    loadingFriend: true,
    pendingFriend: [],
    myFriend: [],
    friendSuggestion: []
  };
export default  function friendReducer(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
      case ADD_FRIEND:
          return {
            ...state,
            loadingFriend: false,
            friendSuggestion: payload 
          };
      case GET_PENDINGFRIEND:
          return {
              ...state,
              loadingFriend: false,
              pendingFriend: payload 
            };
      case GET_MYFRIEND:
        return {
            ...state,
            loadingFriend: false,
            myFriend: payload 
          };
      case GET_FRIENDSUGGESTION:
        return {
            ...state,
            loadingFriend: false,
            friendSuggestion: payload 
          };
      case ACCEPT_REQUEST:
          return {
            ...state,
            pendingFriend: state.pendingFriend.filter((pendFr) => pendFr._id.$oid !== payload),
            loadingFriend: false
          };
      case CANCEL_REQUEST:
        return {
          ...state,
          loadingFriend: false
        };
      case REMOVE_FRIEND:
          return {
            ...state,
            myFriend: state.myFriend.filter((myFr) => myFr._id.$oid !== payload),
            loadingFriend: false
          };
      case ERROR_REQUEST:
        return {
          ...state,
          loadingFriend: false
        };
      case DELETE_REQUEST:
          return {
            ...state,
            pendingFriend: state.pendingFriend.filter((pendFr) => pendFr._id.$oid !== payload),
            loadingFriend: false
          };
      default:
        return state;
    }
  }