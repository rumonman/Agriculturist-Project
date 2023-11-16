import {
    GET_FILE,
    ADD_FILE,
    DELETE_FILE,
    FILE_ERROR,
    ADD_ADV,
    GET_ADV,
    ADV_ERROR,
    DELETE_ADV,
    ADD_POST
  } from './types';
import {instance} from './instance';
import { setAlert } from './alert';
import { getPosts } from './post';
const API = process.env.REACT_APP_API;


//Get FILE 
export const getFile = (id) => async dispatch => {
    const config = {
      headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'multipart/form-data',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    };
    try {
        const {data} = await instance.get(`${API}/getAllFiles/${id}`, config);
        if(data.result.isError === 'true') {
            dispatch(setAlert(data.result.message, 'danger'));
          }
        else {
            dispatch({
              type: GET_FILE,
              payload: JSON.parse(data.data)
            });
        }
    } catch (error) {
        //const errors = error.response;
        dispatch(setAlert('Server Error', 'danger'));
        dispatch({
            type: FILE_ERROR
        });
    }
    
}

//Add File
export const addFile = ({formData},id) => async dispatch => {
  const config = {
    headers : {
      'Authorization': `Bearer ${localStorage.token}`,
      'Content-Type':'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  };
      try {
        console.log('ID = ', id);
        const res = await instance.post(`${API}/posts/${id}`, formData,config);
        if(res.data.result.isError === 'true') {
            dispatch(setAlert(res.data.result.message, 'danger'));
          }
        else {
              await dispatch(getPosts());
              
              dispatch({
                type: ADD_POST,
                payload: res.data
              });
            dispatch({
                type: ADD_FILE,
                payload: res.data
              });
              
              //dispatch(getFile());
              dispatch(setAlert('File uploaded', 'success'));
            }
            
      } catch (error) {
        
        console.log(error.response);
        dispatch(setAlert('Server Error', 'danger'));
        // dispatch({
        //     type: POST_ERROR,
        //     payload: { msg: err.response, status: err.response }
        // });
      }
      
  }
  //Add File
export const updateFile = ({formData},id, filePostID) => async dispatch => {
  const config = {
    headers : {
      'Authorization': `Bearer ${localStorage.token}`,
      'Content-Type':'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  };
      try {
        const res = await instance.put(`${API}/file_update/${id}`, formData, config);
        if(res.data.result.isError === 'true') {
            dispatch(setAlert(res.data.result.message, 'danger'));
          }
          else {
            const postResp = await instance.post(`${API}/posts/${filePostID}`, formData,config);
            if(postResp.data.result.isError === 'true') {
              dispatch(setAlert(res.data.result.message, 'danger'));
            }
            else {
              dispatch(getPosts());
              
              dispatch({
                type: ADD_POST,
                payload: postResp.data
              });
              dispatch({
                type: ADD_FILE,
                payload: res.data
              });
              dispatch(setAlert('File Edited', 'success'));
            }
            
            //dispatch(getFile());
            
          }
      } catch (error) {
        console.log(error.response);
        dispatch(setAlert('Server Error', 'danger'));
        // dispatch({
        //     type: POST_ERROR,
        //     payload: { msg: err.response, status: err.response }
        // });
      }
      
  }

  export const deleteFile = (id) => async dispatch => {
    const config = {
      headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'multipart/form-data',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    };
    try {
        const res = await instance.delete(`${API}/fileDelete/${id}`, config);
        if(res.data.result.isError === 'true') {
            dispatch(setAlert(res.data.result.message, 'danger'));
          }
        else {
            dispatch({
              type: DELETE_FILE,
              payload: id
            });
            //dispatch(getFile());
            dispatch(setAlert('File Deleted', 'success'));
        } 
      } catch (error) {
        console.log(error.response);
        dispatch(setAlert('Server Error', 'danger'));
      }
  }

  //Add Advertise 
  export const uploadAdvertise = (formData) => async dispatch => {
    const config = {
      headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'multipart/form-data',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      }
    };
    try {
      //console.log(localStorage.token);
      const res = await instance.post(`${API}/upload_advertise`, formData, config);
      //console.log('Advertise = ',res)
      if(res.data.result.isError === 'true') {
          dispatch(setAlert(res.data.result.message, 'danger'));
        }
        else {
          dispatch({
            type: ADD_ADV,
            payload: res.data
          });
          dispatch(getAdvertise());
          dispatch(setAlert('Advertisement Added', 'success'));
        }
    } catch (error) {
      console.log(error);
      console.log(error.response);
      dispatch(setAlert('Server Error', 'danger'));
    }
    
}

//Get All advertise
//Get FILE 
export const getAdvertise = () => async dispatch => {
  const config = {
    headers : {
      'Authorization': `Bearer ${localStorage.token}`,
      'Content-Type':'multipart/form-data',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  };
  try {
      const {data} = await instance.get(`${API}/get_Advertise`, config);
      //console.log('Get Adv', data);
      if(data.result.isError === 'true') {
          dispatch(setAlert(data.result.message, 'danger'));
        }
      else {
          dispatch({
            type: GET_ADV,
            payload: JSON.parse(data.data)
          });
      }
  } catch (error) {
      //const errors = error.response;
      dispatch(setAlert('Server Error', 'danger'));
      dispatch({
          type: ADV_ERROR
      });
  }
  
}

export const deleteAdvertise = (id) => async dispatch => {
  const config = {
    headers : {
      'Authorization': `Bearer ${localStorage.token}`,
      'Content-Type':'multipart/form-data',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    }
  };
  try {
      const res = await instance.delete(`${API}/delete_advertise/${id}`, config);
      if(res.data.result.isError === 'true') {
          dispatch(setAlert(res.data.result.message, 'danger'));
        }
      else {
          dispatch({
            type: DELETE_ADV,
            payload: id
          });
          dispatch(getAdvertise());
          dispatch(setAlert('Advertise Deleted', 'success'));
      } 
    } catch (error) {
      console.log(error.response);
      dispatch(setAlert('Server Error', 'danger'));
    }
}