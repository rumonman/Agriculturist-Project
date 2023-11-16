import React, { Fragment, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Advertisement from '../dashboard/Advertisement';
import { getAllUsers, loadUser } from '../../actions/auth';
import axios from 'axios';
import {
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriendRequest,
  cancelFriendRequest,
  getPendingFrUser,
  getFriendSuggestion
} from '../../actions/friends';
import {
  ERROR_REQUEST,
  DELETE_REQUEST,
  ACCEPT_REQUEST
} from '../../actions/types';
import { setAlert } from '../../actions/alert';
import PropTypes from 'prop-types';
import Spinner from '../layout/Spinner';
const IMAGEURL = process.env.REACT_APP_CLOUDINARY;
const API = process.env.REACT_APP_API;

const AddFriendList = ({
  auth: { allUsers, user },
  friend: {pendingFriend, friendSuggestion, loadingFriend},
  getAllUsers,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriendRequest,
  cancelFriendRequest,
  getPendingFrUser,
  getFriendSuggestion,
  loadUser,
}) => {
  const [isSendRequest, setIsSendRequest] = useState(false);
  const dispatch = useDispatch()
  // const [friendSuggestionList, setFriendSuggestionList] = useState([])
  const [loadFriend, setLoadFriend] = useState(false);
  useEffect(() => {
    console.log('calling useEffect of AddFriendList');
    loadUser();
    getPendingFrUser();
    setIsSendRequest(isSendRequest);
    //getFriends();
    getFriendSuggestion();
    setTimeout(() => {
      setLoadFriend(false) 
    }, 1000);
    
  }, [ loadUser, isSendRequest,getFriendSuggestion, getPendingFrUser]);
  //const [pendingFriend, setPendingFriend] = useState([]);
  //const [addFriendList, setAddFriendList] = useState([]);
  // const [isSetPenFr, setIsSetPenFr] = useState(true);
  
//   const getFriends = async () => {
//     let userInfo = []

//     dispatch(getFriendSuggestion((res, err) => {
//         if (res?.data?.data) {
//             setLoadFriend(false)
//             userInfo = JSON.parse(res.data.data)
//             console.log('Friend suggestion in callback ',userInfo);
//         }
//     }))
//     setFriendSuggestionList(userInfo || [])
  // }
  
  const config = {
      headers : {
          'Authorization': `Bearer ${localStorage.token}`,
          'Content-Type':'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
      }
  };
  
  const addFriendRequest = async (id) => {
    setLoadFriend(true);
    try {
      const res = await axios.get(`${API}/friendReq/${id}`, config
      );
      if(res.data.result.isError === 'false') {
        await getFriendSuggestion();
        await loadUser();
        await getAllUsers();
        dispatch(setAlert(res.data.result.message, 'success'));
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
    //await dispatch(sendFriendRequest(id));
    //setIsSendRequest(!isSendRequest);
    setLoadFriend(false);
  };
  const cancelFrRequest = async (id) => {
    setLoadFriend(true);
    //await dispatch(cancelFriendRequest(id));
     try {
       const res = await axios.get(`${API}/cancelFrndReq/${id}`, config,
       {withCredentials:true});
      if(res.data.result.isError === 'false') {
        await getFriendSuggestion();
        await loadUser();
        await getAllUsers();
        dispatch(setAlert(res.data.result.message, 'success'));
      }
      else {
        dispatch(setAlert(res.data.result.message, 'danger'));
        dispatch({
          type: ERROR_REQUEST
        });
      }
      
    } catch (err) {
      console.log('Error in canceling friend request',err);
      dispatch(setAlert('Something went wrong', 'danger'));
      dispatch({
        type: ERROR_REQUEST
      });
    }
    //setIsSendRequest(!isSendRequest);
    setLoadFriend(false);
  };
  const deleteFrRequest = async (id) => {
    setLoadFriend(true);
    try {
      const res = await axios.get(`${API}/friendReqDel/${id}`, config);
      if(res.data.result.isError === 'false') {
        await getFriendSuggestion();
        await getPendingFrUser();
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
      dispatch(setAlert('Error in deleting friend request', 'danger'));
    }
    setLoadFriend(false);
  };
  const acceptFrRequest = async (id) => {
    setLoadFriend(true);
    //await dispatch(acceptFriendRequest({ id }));
    //setIsSendRequest(!isSendRequest);
    try {
      const res = await axios.get(`${API}/friendReqAccept/${id}`, config);
      if(res.data.result.isError === 'false') {
        
        await getPendingFrUser();
        await getFriendSuggestion();
        await loadUser();
        dispatch(setAlert(res.data.result.message, 'success'));
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
      dispatch(setAlert('Error in accepting friend request', 'danger'));
      dispatch({
        type: ERROR_REQUEST
      });
    }
    setLoadFriend(false);
  };
 

  return loadFriend ? (
    <Spinner />
  ) : (
    <Fragment>
      <div className='container-fluid'>
        <div
          className='d-sm-flex align-items-center 
                            justify-content-between mb-4'
        >
          <h1 className='h3 mb-0 text-gray-800'>Friends</h1>
        </div>
        <div className='row'>
          <div className='col-sm-12 col-md-6 col-lg-9'>
            <div className='card shadow mb-4'>
              <div className='card-header py-3'>
                <h6 className='m-0 font-weight-bold text-primary'>
                  Friend Requests
                </h6>
              </div>
              {pendingFriend.length > 0
                ? pendingFriend.map((pendingFr) => (
                    <div
                      key={pendingFr._id.$oid}
                      id='posts-list'
                      className='card-body friendCard'
                    >
                      <div className='post-card card'>
                        <div className='row'>
                          <div className='col-sm-12 col-md-12 col-lg-4'>
                            <img
                              src={IMAGEURL+pendingFr.image}
                              alt={pendingFr.name}
                              className='friendImageProfile'
                            />
                          </div>
                          <div className='col-sm-12 col-md-12 col-lg-8'>
                            <Link
                              to={{
                                pathname: '/profile',
                                state: {
                                  id: pendingFr._id.$oid,
                                },
                              }}
                            >
                              <h4>{pendingFr.name}</h4>
                            </Link>

                            <Link
                              to='/friends'
                              onClick={() =>
                                acceptFrRequest(pendingFr._id.$oid)
                              }
                              className='btn btn-primary'
                              style={{ marginRight: 5 }}
                            >
                              Accept Request
                            </Link>
                            <Link
                              to='/friends'
                              onClick={() =>
                                deleteFrRequest(pendingFr._id.$oid)
                              }
                              className='btn btn-secondary'
                            >
                              Delete Request
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : null}
            </div>

            <hr />

            <div className='card shadow mb-4'>
              <div className='card-header py-3'>
                <h6 className='m-0 font-weight-bold text-primary'>
                  People You May Know
                </h6>
              </div>
              {friendSuggestion.length > 0
                ? friendSuggestion.map((frUser) => (
                    <div
                      key={frUser._id.$oid}
                      id='posts-list'
                      className='card-body friendCard'
                    >
                      <div className='post-card card'>
                        <div className='row'>
                          <div className='col-sm-12 col-md-12 col-lg-4'>
                            <img
                              src={IMAGEURL+frUser.image}
                              alt='User'
                              className='friendImageProfile'
                            />
                          </div>
                          <div className='col-sm-12 col-md-12 col-lg-8'>
                            <Link
                              to={{
                                pathname: '/profile',
                                state: {
                                  id: frUser._id.$oid,
                                },
                              }}
                            >
                              <h4>{frUser.name}</h4>
                            </Link>
                            {frUser.hasOwnProperty('friend_pending') ? (
                              frUser.friend_pending.filter(
                                (fr) => fr.$id.$oid === user._id.$oid
                              ).length > 0 ? (
                                <>
                                  <Link
                                    to='/friends'
                                    onClick={() =>
                                      cancelFrRequest(frUser._id.$oid)
                                    }
                                    className='btn btn-secondary'
                                  >
                                    Cancel Request
                                  </Link>
                                </>
                              ) : (
                                <>
                                  <Link
                                    to='/friends'
                                    onClick={() =>
                                      addFriendRequest(frUser._id.$oid)
                                    }
                                    className='btn btn-primary'
                                  >
                                    Add Friend
                                  </Link>
                                </>
                              )
                            ) : (
                              <>
                                <Link
                                  to='/friends'
                                  onClick={() =>
                                    sendFriendRequest(frUser._id.$oid)
                                  }
                                  className='btn btn-primary'
                                >
                                  Add Friend
                                </Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                : null}
            </div>
          </div>

          <Advertisement />
        </div>
      </div>
    </Fragment>
  );
};
AddFriendList.propTypes = {
  //setAlert: PropTypes.func.isRequired,
  getAllUsers: PropTypes.func.isRequired,
  sendFriendRequest: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  friend: PropTypes.object.isRequired
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  friend: state.friend
});
export default connect(mapStateToProps, {
  getAllUsers,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriendRequest,
  cancelFriendRequest,
  getPendingFrUser,
  loadUser,
  getFriendSuggestion
})(AddFriendList);
