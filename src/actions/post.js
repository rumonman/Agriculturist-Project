import {
    API_REQUEST_START,
    ADD_POST,
    POST_ERROR,
    GET_POST,
    GET_SHAREPOST,
    GET_POSTS,
    DELETE_POST,
    ADD_COMMENT,
    REMOVE_COMMENT
  } from './types';
  //import setAuthToken from '../utils/setAuthToken';
//import { Alert } from 'reactstrap';
//import axios from 'axios';
import {instance} from './instance';
import { setAlert } from './alert';
//import {config} from './config';
const API = process.env.REACT_APP_API;


export const getPosts = () => async dispatch => {
  console.log("Calling getPosts ");
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  try {
    const res = await instance.get(`${API}/getAllPost`,config);
    //console.log('All posts = ',JSON.parse(res.data.data));
    dispatch({
      type: GET_POSTS,
      payload: JSON.parse(res.data.data)
    });
  } catch (err) {
    console.log("Error in GetPost ", err);
    dispatch({
      type: POST_ERROR,
      payload: err.response
    });
  }
};
// Add post
export const addPost = ({formData}, id, edit=false) => async dispatch => {
    const config = {
        headers : {
            'Authorization': `Bearer ${localStorage.token}`,
            'Content-Type':'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }
    };
    try {
      //console.log('Id in addpost = ', id);
      dispatch({
        type: API_REQUEST_START
      });
      const res = await instance.post(`${API}/posts/${id}`, formData,config);
      //console.log('Post Response', res.data);
      if(res.data.result.isError === 'true') {
        dispatch(setAlert(res.data.result.message, 'danger'));
      }
      else {
        dispatch(getPosts());
        dispatch({
          type: ADD_POST,
          payload: res.data
        });
        
        if(edit) dispatch(setAlert('Post Updated', 'success'));
        else dispatch(setAlert('Post Created', 'success'));
      }
      return res.data;
    } catch (err) {
        console.log(err);
        console.log(err.response);
      dispatch(setAlert('Server Error', 'danger'));
      dispatch({
        type: POST_ERROR,
        payload: { msg: err.response, status: err.response }
      });
      throw err;
    }
  };

  // Get post
export const getPost = id => async dispatch => {
  //console.log("Calling GetPost = ", id);
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  try {
    const res = await instance.get(`${API}/get_post/${id}`,config);
    //console.log("Getting Post = ", res.data.data);
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch({
        type: GET_POST,
        payload: JSON.parse(res.data.data.post)
      });
    }
  } catch (err) {
    dispatch(setAlert('Post not found', 'danger'));
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response }
    });
  }
};
// For Sharing get post
// Get post
export const getSharePost = id => async dispatch => {
  //console.log("Calling GetPost = ", id);
  const config = {
    headers : {
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  try {
    const res = await instance.get(`${API}/get_sharepost/${id}`,config);
    //console.log("Getting Post = ", res.data.data);
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch({
        type: GET_SHAREPOST,
        payload: JSON.parse(res.data.data.post)
      });
    }
  } catch (err) {
    dispatch(setAlert('Post not found', 'danger'));
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response }
    });
  }
};



//Delete Post
export const deletePost = id => async dispatch => {
  console.log("Calling Deletpost = ", id);
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  try {
    const res = await instance.delete(`${API}/delete_post/${id}`,config);
    console.log("Getting Delete Data = ", res.data);
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch({
        type: DELETE_POST,
        payload: id
      });
      dispatch(setAlert('Post Removed', 'success'));
    }
  } catch (err) {
    dispatch(setAlert('Post not found or Server Error', 'danger'));
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response }
    });
  }
};
// Add comment
export const addComment = (postId, formData) => async dispatch => {
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  try {
    const res = await instance.post(`${API}/comments/${postId}`, formData,config);
    //console.log(res.data);
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch({
        type: ADD_COMMENT,
        payload: JSON.parse(res.data.data)
      });
      dispatch(setAlert('Comment Added', 'success'));
    } 
  } catch (err) {
    dispatch(setAlert('Server Error', 'success'));
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response }
    });
  }
};

// Delete comment
export const deleteComment = (postId, commentId) => async dispatch => {
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  try {
    const res = await instance.delete(`${API}/delete_comment/${postId}/${commentId}`,config);
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch({
        type: REMOVE_COMMENT,
        payload: commentId
      });
  
      dispatch(setAlert('Comment Removed', 'success'));
    }
    
  } catch (err) {
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response }
    });
  }
}
// Update comment
export const updateComment = (postId, commentId, cmntBody) => async dispatch => {
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  //console.log('Comment Id in update Comment = ',typeof {cmntBody});
  try {
    const res = await instance.put(`${API}/update_comment/${postId}/${commentId}`,{cmntBody},config);
    //console.log('Update comment', res.data);
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      // dispatch({
      //   type: REMOVE_COMMENT,
      //   payload: commentId
      // });
      // dispatch({
      //   type: ADD_COMMENT,
      //   payload: JSON.parse(res.data.data)
      // });
      dispatch(getPost(postId));
      dispatch(setAlert('Comment Updated', 'success'));
    } 
  } catch (err) {
    dispatch(setAlert('Server Error', 'danger'));
    dispatch({
      type: POST_ERROR,
      payload: { msg: err.response }
    });
  }
}
