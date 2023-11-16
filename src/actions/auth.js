import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    ALLUSER_LOADED,
    LOGOUT,
    DELETE_USER,
    ADD_CSS_CLASS
  } from './types';
//import setAuthToken from '../utils/setAuthToken';
import axios from 'axios';
import {instance} from './instance';
import { setAlert } from './alert';
//import {config} from './config';
const API = process.env.REACT_APP_API;

//Toggle class for adding css style
export const toggleCssClass = (value) => async dispatch => {
  try {
    //console.log('Value = ', value);
    dispatch({
      type: ADD_CSS_CLASS,
      payload: value
    });
    //dispatch(loadUser());
  } catch(err){
    console.log('Error in toggle class function',err);
  }
}

// Load User
export const loadUser = () => async dispatch => {
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  try {
    //console.log('Calling LoadUser', localStorage.token);
    const res = await instance.get(`${API}/user`, config);
    //console.log('Auth response = ',JSON.parse(res.data.data));
    if(res.data.result.isError === 'false') {
      dispatch({
        type: USER_LOADED,
        payload: JSON.parse(res.data.data)
      });
    }
    // else {
    //   // dispatch(setAlert(res.data.result.message, 'danger'));
    //   dispatch({
    //     type: AUTH_ERROR
    //   });
    // }
    
  } catch (err) {
    dispatch({
      type: AUTH_ERROR
    });
    console.log('Error in loaduser ', err);
  }
};
//Load All user
export const getAllUsers = () => async dispatch => {
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  try {
    const res = await axios.get(`${API}/getAllUser`, config);
    //console.log('All User',JSON.parse(res.data.data));
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch({
        type: ALLUSER_LOADED,
        payload: JSON.parse(res.data.data)
      });
    }
  } catch (err) {
    //const errors = err.response;
    dispatch(setAlert('Something went wrong', 'danger'));
    console.log('Error in getting all user = ',err);
    // dispatch({
    //   type: AUTH_ERROR
    // });
  }
}
// Register User
export const userRegister = ({form_data}) => async dispatch => {
  try {
    
    const res = await axios.post(`${API}/add`, form_data);
    console.log('Users data', res.data);
    if (res.data.result.isError === 'true') {
      dispatch({
        type: REGISTER_FAIL
      });
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch({
        type: REGISTER_SUCCESS,
        payload: res.data
      });
      dispatch(setAlert(res.data.result.message, 'success'));
    }
    
    //dispatch(loadUser());
  } catch (err) {
    console.log("Error in registration = ", err);
    dispatch(setAlert('Server Error', 'danger'));
    // const errors = err.response;
    // console.log(errors);
    dispatch({
      type: REGISTER_FAIL
    });
  }
};
// Login User
export const login = (email, password) => async dispatch => {
  const config = {
      headers : {
          'Content-Type':'application/json',
          'Access-Control-Allow-Origin': '*'
      }
  };
  const body = {email, password};
  //console.log('Login data',body);
  // const res = await axios.post(`${API}/email_test`, body, config);
  // console.log('Login response', res.data);
  
  try {
    const res = await axios.post(`${API}/login`, body, config);
    //console.log('Login response', res.data);
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data.data
      });
      dispatch(loadUser());
    }
  } catch (err) {
    //const errors = err.response;
    dispatch(setAlert('Server Error', 'danger'));
    console.log('Error in login = ',err);
    // if (errors) {
    //   <Alert>{errors}</Alert>
    //   //errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    // }

    dispatch({
      type: LOGIN_FAIL
    });
  }
};
export const updateProfile = (id, {form_data}) => async dispatch => {
    
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
    try {
    const res = await instance.put(`${API}/update/${id}`, form_data,config);
    console.log('Profile Updated', res.data);
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch(loadUser());
      dispatch(setAlert('Profile Updated', 'success'));
    }
    } catch (err) {
      console.log(err);
      dispatch(setAlert('Something went wrong. Profile Not Updated', 'danger'));
    }
};

// Logout
export const logout = () => dispatch => {  
  //dispatch( { type : CLEAR_PROFILE });
  dispatch( {type: LOGOUT} );
  window.location.replace("http://15.235.163.6");
  //window.location.replace("http://localhost:3000"); 
  //dispatch(loadUser());
};

//delete specific user
export const deleteUser =(id) => async dispatch => {
  const config = {
    headers : {
        'Authorization': `Bearer ${localStorage.token}`,
        'Content-Type':'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
    }
  };
  try {
    const res = await instance.delete(`${API}/delete_ac/${id}`, config);
    //console.log('Profile Updated', res.data);
    if(res.data.result.isError === 'true') {
      dispatch(setAlert(res.data.result.message, 'danger'));
    }
    else {
      dispatch({
        type: DELETE_USER,
        payload: id
      });
      dispatch(loadUser());
      dispatch(setAlert('User Deleted', 'success'));
    }
    } catch (err) {
      console.log(err.response);
      dispatch(setAlert('Something went wrong. User Not Deleted', 'danger'));
    }
}