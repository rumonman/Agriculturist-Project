import {
    GET_POSTS,
    POST_ERROR,
    DELETE_POST,
    API_REQUEST_START,
    ADD_POST,
    GET_POST,
    GET_SHAREPOST,
    ADD_COMMENT,
    REMOVE_COMMENT
  } from '../actions/types';
  
  const initialState = {
    posts: [],
    post: null,
    sharepost: null,
    file: null,
    loading: true,
    isSuccess: false,
    error: {}
  };
  
  function postReducer(state = initialState, action) {
    const { type, payload } = action;
  
    switch (type) {
      case API_REQUEST_START:
        return {
          ...state,
          loading: true,
        };
      case GET_POSTS:
        return {
          ...state,
          posts: payload,
          loading: false,
        };
      case GET_POST:
        return {
          ...state,
          post: payload,
          loading: false,
        };
      case GET_SHAREPOST:
        return {
            ...state,
            sharepost: payload,
            loading: false
          };
      case ADD_POST:
        return {
          ...state,
          loading: false,
          isSuccess: true
        };
      case DELETE_POST:
        return {
          ...state,
          posts: state.posts.filter((post) => post._id.$oid !== payload),
          loading: false
        };
      case POST_ERROR:
        return {
          ...state,
          error: payload,
          loading: false,
          isSuccess: false
        };
     
      case ADD_COMMENT:
        return {
          ...state,
          post:  { ...state.post, comments: [...state.post.comments, payload] },
          loading: false
        };
      case REMOVE_COMMENT:
        return {
          ...state,
          post: {
            ...state.post,
            comments: state.post.comments.filter(
              (comment) => comment._id.$oid !== payload
            )
          },
          loading: false
        };
      default:
        return state;
    }
  }
  
  export default postReducer;