import {
    GET_PENDINGFRIEND,
    GET_MYFRIEND,
    GET_FRIENDSUGGESTION,
    ERROR_REQUEST,
    REMOVE_FRIEND,
    DELETE_REQUEST,
    ACCEPT_REQUEST
} from './types';
import {instance} from './instance';
import { setAlert } from './alert';
//import {config} from './config';
import {getAllUsers, loadUser} from './auth';
const API = process.env.REACT_APP_API;



//Load pending user friend
export const getPendingFrUser = () => async dispatch => {
  //console.log('Calling pending user function');
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  try {
    const res = await instance.get(`${API}/getPendFrUser`, config);
    console.log('All pending User',JSON.parse(res.data.data));
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch({
        type: GET_PENDINGFRIEND,
        payload: JSON.parse(res.data.data)
      });
    }
  } catch (err) {
    //const errors = err.response;
    dispatch(setAlert('Something went wrong', 'danger'));
    console.log('Error in getting all pending user = ',err);
    dispatch({
      type: ERROR_REQUEST
    });
  }
}

//Load pending user friend
export const getUserMyFr = () => async dispatch => {
  //console.log('Calling pending user function');
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  try {
    const res = await instance.get(`${API}/getUserFriend`, config);
    console.log('All User Friend',JSON.parse(res.data.data));
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch({
        type: GET_MYFRIEND,
        payload: JSON.parse(res.data.data)
      });
    }
  } catch (err) {
    //const errors = err.response;
    dispatch(setAlert('Something went wrong', 'danger'));
    console.log('Error in getting all users friend = ',err);
    dispatch({
      type: ERROR_REQUEST
    });
  }
}

//Load user friend suggestion
export const getFriendSuggestion = () => async (dispatch) => {
  //console.log('Calling pending user function');
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  try {
    const res = await instance.get(`${API}/getFriendSuggestion`, config);
    console.log('All Suggested Friend',JSON.parse(res.data.data));
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch({
        type: GET_FRIENDSUGGESTION,
        payload: JSON.parse(res.data.data)
      });
    }
    //callback(res, null)
  } catch (err) {
    //const errors = err.response;
    dispatch(setAlert('Something went wrong', 'danger'));
    console.log('Error in getting friend Suggestion = ',err);
    dispatch({
      type: ERROR_REQUEST
    });
    //callback(null, err.response)
  }
}


// Send Friend request
export const sendFriendRequest = (id) => async dispatch => {
  //console.log(localStorage.token);
    const config = {
      headers : {
          'Authorization': `Bearer ${localStorage.token}`,
          'Content-Type':'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
      }
    };
    try {
      //console.log('Calling SendFriendRq', id);
      //console.log(config);
      const res = await instance.get(`${API}/friendReq/${id}`, config);
      //console.log('Friend response = ',res.data);
      if(res.data.result.isError === 'false') {
        // console.log('calling getalluser from friend');
        //getAllUsers();
        await dispatch(getFriendSuggestion());
        await loadUser();
        await getAllUsers();
        //console.log('loaduser response ',resp);
        dispatch(setAlert(res.data.result.message, 'success'));
        //window.location.reload(false);
        // dispatch({
        //   type: ADD_FRIEND,
        //   payload: JSON.parse(res.data.data)
        // });
      }
      else {
        dispatch(setAlert(res.data.result.message, 'danger'));
        dispatch({
          type: ERROR_REQUEST
        });
      }
      
    } catch (err) {
      console.log('Error in sending friend request',err);
      dispatch(setAlert('Something went wrong', 'danger'));
      dispatch({
        type: ERROR_REQUEST
      });
    }
  };

  // Accept Friend request
export const acceptFriendRequest = (id) => async dispatch => {
  //console.log(localStorage.token);
    const config = {
      headers : {
          'Authorization': `Bearer ${localStorage.token}`,
          'Content-Type':'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
      }
    };
    try {
      //console.log('Calling SendFriendRq', id);
      //console.log(config);
      const res = await instance.get(`${API}/friendReqAccept/${id}`, config);
      //console.log('Accept Friend response = ',res.data);
      if(res.data.result.isError === 'false') {
        //getAllUsers();
        getPendingFrUser();
        loadUser();
        dispatch(setAlert(res.data.result.message, 'success'));
        //window.location.reload(false);
        dispatch({
          type: ACCEPT_REQUEST,
          payload: id
        });
      }
      else {
        dispatch(setAlert(res.data.result.message, 'danger'));
        dispatch({
          type: ERROR_REQUEST
        });
      }
      
    } catch (err) {
      console.log('Error in sending friend request',err);
      dispatch(setAlert('Something went wrong', 'danger'));
      dispatch({
        type: ERROR_REQUEST
      });
    }
  };

// Delete Friend request
export const deleteFriendRequest = (id) => async dispatch => {
  //console.log(localStorage.token);
    const config = {
      headers : {
          'Authorization': `Bearer ${localStorage.token}`,
          'Content-Type':'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
      }
    };
    try {
      //console.log('Calling SendFriendRq', id);
      //console.log(config);
      const res = await instance.get(`${API}/friendReqDel/${id}`, config);
      //console.log('Delete Friend response = ',res.data);
      if(res.data.result.isError === 'false') {
        //getAllUsers();
        getFriendSuggestion();
        getPendingFrUser();
        loadUser();
        dispatch(setAlert(res.data.result.message, 'success'));
        dispatch({
          type: DELETE_REQUEST,
          payload: id
        });
      }
      else {
        dispatch(setAlert(res.data.result.message, 'danger'));
        dispatch({
          type: ERROR_REQUEST
        });
      }
      
    } catch (err) {
      console.log('Error in sending friend request',err);
      dispatch(setAlert('Something went wrong', 'danger'));
      // dispatch({
      //   type: ERROR_FRIEND
      // });
    }
  };
// Delete Friend request
export const removeFriendFromFrList = (id) => async dispatch => {
  //console.log(localStorage.token);
    const config = {
      headers : {
          'Authorization': `Bearer ${localStorage.token}`,
          'Content-Type':'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
      }
    };
    try {
      //console.log('Calling RemoveFriendRq', id);
      //console.log(config);
      const res = await instance.get(`${API}/rmFriend/${id}`, config);
      //console.log('Remove Friend response = ',res.data);
      if(res.data.result.isError === 'false') {
        //getAllUsers();
        getUserMyFr();
        loadUser();
        dispatch(setAlert(res.data.result.message, 'success'));
        dispatch({
          type: REMOVE_FRIEND,
          payload: id
        });
      }
      else {
        dispatch(setAlert(res.data.result.message, 'danger'));
        dispatch({
          type: ERROR_REQUEST
        });
      }
      
    } catch (err) {
      console.log('Error in removing friend request',err);
      dispatch(setAlert('Something went wrong', 'danger'));
      dispatch({
        type: ERROR_REQUEST
      });
    }
  };
  // Cancel Friend request
export const cancelFriendRequest = (id) => async dispatch => {
  //console.log(localStorage.token);
    const config = {
      headers : {
          'Authorization': `Bearer ${localStorage.token}`,
          'Content-Type':'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
      }
    };
    try {
      //console.log('Calling SendFriendRq', id);
      //console.log(config);
      const res = await instance.get(`${API}/cancelFrndReq/${id}`, config);
      //console.log('Cancel Friend response = ',res.data);
      if(res.data.result.isError === 'false') {
        //getAllUsers();
        await dispatch(getFriendSuggestion());
        await loadUser();
        await getAllUsers();
        dispatch(setAlert(res.data.result.message, 'success'));
        //window.location.reload(false);
      //   dispatch({
      //     type: ADD_FRIEND,
      //     payload: JSON.parse(res.data.data)
      //   });
      }
      else {
        dispatch(setAlert(res.data.result.message, 'danger'));
        dispatch({
          type: ERROR_REQUEST
        });
      }
      
    } catch (err) {
      console.log('Error in sending friend request',err);
      dispatch(setAlert('Something went wrong', 'danger'));
      dispatch({
        type: ERROR_REQUEST
      });
    }
  };