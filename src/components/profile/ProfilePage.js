import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '../layout/Spinner';
import Advertisement from '../dashboard/Advertisement';
import { loadUser, updateProfile, getAllUsers } from '../../actions/auth';
import { getFile } from '../../actions/file';
//import { setAlert } from '../../actions/alert';
import Alert from '../layout/Alert';
import Compress from 'browser-image-compression';
import {Image} from 'cloudinary-react';
import download from 'downloadjs';
import axios from 'axios';
import {
  sendFriendRequest,
  cancelFriendRequest,
  getFriendSuggestion
} from '../../actions/friends';
import {
  ERROR_REQUEST
} from '../../actions/types';
import { setAlert } from '../../actions/alert';

const ADMIN = process.env.REACT_APP_ADMIN;
const IMAGEURL = process.env.REACT_APP_CLOUDINARY;
const API = process.env.REACT_APP_API;
const initialState = {
  firstname: '',
  middlename: '',
  lastname: '',
  user_category: '',
  student_type: '',
  job_type: '',
  specialization_type: '',
  email: '',
  phone: '',
  password: '',
  passwordconfirm: '',
  address: '',
  country: '',
  image: '',
};

const ProfilePage = ({
  auth: { user, loading, allUsers },
  file:{files},
  friend: {myFriend, friendSuggestion, loadingFriend},
  getAllUsers,
  sendFriendRequest,
  cancelFriendRequest,
  loadUser,
  updateProfile,
  props,
  getFile,
}) => {

  const dispatch = useDispatch();
  const [file, setFile] = useState('');
  const [viewImage, setViewImage] = useState('../../img/user-profile.png');
  const [showImageFlag, setShowImageFlag] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileLoading, setFileLoading] = useState(true);
  const [isSendRequest, setIsSendRequest] = useState(false);
  const [loadFriend, setLoadFriend] = useState(false);
  //const [ownUser, setOwnUser] = useState(null);
  let isSearch = false, userEmail = null, otherUserId=null, ownUser=[];
  useEffect( () => {
    const fetchData = async () => {
      console.log('Calling profilePage useEffect');

      try {
        await getAllUsers();
        await loadUser();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

   fetchData();
    
    if (!loading && user) {
      const profileData = { ...initialState };
      for (const key in user) {
        if (key in profileData) profileData[key] = user[key];
      }
      //console.log("Profile Data = ", profileData);
      setFormData(profileData);
    }
    //getPendingFrUser();
    setIsSendRequest(isSendRequest);
    //getFriends();
    //getFriendSuggestion();
    setTimeout(() => {
      setLoadFriend(false) 
    }, 2000);
    
  }, [dispatch]);
  //console.log('Loading in Profilepage', loading);
  //console.log('User in ProfilePage', user);
  if (props.location.state) {
    //console.log('Calling location state');
    if (user !== null) {
      userEmail = user.email;
      otherUserId = props.location.state.id;
      ownUser = user;
      
      if (user._id.$oid !== otherUserId) {
        if(fileLoading) {
          //console.log('Search in file profile page ', files);
          getFile(otherUserId);
          setFileLoading(false);
        }
        
        let userSearch = [];
        userSearch = allUsers.filter(
          (us) => us._id.$oid === otherUserId
        );
        if(userSearch.length > 0){
            user = Object.assign({}, userSearch[0]);
            isSearch = true;
        }
        
      }
    }
  }

  
  

  const {
    firstname,
    middlename,
    lastname,
    user_category,
    student_type,
    job_type,
    specialization_type,
    email,
    phone,
    address,
    country,
    image,
  } = formData;
  
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
    //sendFriendRequest(id);
    //setIsSendRequest(!isSendRequest);
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
    setLoadFriend(false);
  };
  const cancelFrRequest = async (id) => {
    setLoadFriend(true);
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
    //cancelFriendRequest(id);
    //setIsSendRequest(!isSendRequest);
    setLoadFriend(false);
  };
  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  
  const imageHandler = async (e) => {
    setFile(e.target.files[0]);
    var fileUpload = e.target.files[0];
    if(fileUpload) setViewImage(URL.createObjectURL(e.target.files[0]));
    //var convertedBlobFile;
    //console.log('Calling image handlaer');
    const options = {
      //maxSizeMB: 5,
      maxWidth: 300, // the max width of the output image, defaults to 1920px
      maxHeight: 300, // the max height of the output image, defaults to 1920px
      resize: true,
      useWebWorker: true,
    };

    const reader = new FileReader();
    reader.onload = async () => {
      if (reader.readyState === 2) {
        try {
          const compressedFile = await Compress(fileUpload, options);
          //setFile(compressedFile);
          //processfile(compressedFile, options);
          
        } catch (e) {
          // Show the user a toast message or notification that something went wrong while compressing file
          alert('File size must be less than 10MB');
          console.log('Error in compress = ', e);
        }
        setShowImageFlag(true);
        // console.log('Image flag ', showImageFlag);
        // console.log('View Image ', viewImage);
      }
    };
    if (fileUpload) reader.readAsDataURL(fileUpload);
  };

  const getFormData = (object) =>
    Object.keys(object).reduce((formData, key) => {
      formData.append(key, object[key]);
      return formData;
    }, new FormData());
  const onSubmit = async (e) => {
    e.preventDefault();
    const form_data = getFormData(formData);
    form_data.append('file', file);
    if (showImageFlag) form_data.append('viewImage', viewImage);
    else form_data.append('viewImage', image);
    form_data.append('student_type', student_type);
    form_data.append('job_type', job_type);
    form_data.append('specialization_type', specialization_type);
    //console.log('Form Data = ', form_data);
    updateProfile(user._id.$oid, { form_data });
    //console.log('Return Value = ', returnValue);
  };

  const downloadFile = async (filename, mimetype) => {
    try {
      const result = await axios.get(`${API}/file/${filename}`, {
        responseType: 'blob'
      });
      //console.log("File Return Data = ", result.data);
      // const split = path.split('/');
      // const filename = split[split.length - 1];
      setErrorMsg('');
      return download(result.data, filename, mimetype);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMsg('Error while downloading file. Try again later');
      }
    }
  };
  
  return (
    !loadFriend && user !== null ? (
        <Fragment>
          <div className='container-fluid'>
            <div className='d-sm-flex align-items-center justify-content-between mb-4'>
              <h1 className='h3 mb-0 text-gray-800'>Profile</h1>
            </div>
            <div id='profile-view' className='row'>
              <div className='col-sm-12 col-md-6 col-lg-9'>
                <div id='profile-image-card' className='common-card'>
                  {userEmail === ADMIN || !isSearch ? (
                    <Link
                      to={{
                        pathname: '/profile',
                        state: {
                                    id: user._id.$oid,
                                  },
                      }}
                      className='pen picture-pen'
                      data-toggle='modal'
                      data-target='#myModal'
                    >
                      <i className='fas fa-camera'></i>
                    </Link>
                  ) : null}
                  <div id='profile-image'>
                    <div id='profile-image-container'> 
                    <Image cloudName="daf1cgy1c" publicId={IMAGEURL+user.image}/>
                    {/* <img src={window.location.origin+'../api/image/HM0010701-F.jpg'} alt='profile' /> */}
                      {/* <img src={'F:/Coursera/React_Flask/SocialNetwork/frontend/api/image/garden-festival.jpg'} alt='profile' /> 
                      <img src={' http://127.0.0.1:8080/image/garden-festival.jpg'} alt='profile' />  */}
                      {/* <h6>{user.name}</h6> */}
                    </div>
                    
                    {/* {!isSearch ? (
                      <Link to='/profile' className='profile-add-link'>
                        Add Contact
                      </Link>
                    ) : (
                      <Link
                        to='/profile'
                        className='profile-add-link'
                        style={{ cursor: 'default' }}
                        onClick={(event) => event.preventDefault()}
                      >
                        Add Contact
                      </Link>
                    )} */}
                    {/* {!isSearch ? (
                      <Link to='/profile' className='profile-message-link'>
                        Message
                      </Link>
                    ) : (
                      <Link
                        to='/profile'
                        className='profile-message-link'
                        style={{ cursor: 'default' }}
                        onClick={(event) => event.preventDefault()}
                      >
                        Message
                      </Link>
                    )} */}
                    {
                      isSearch ? (
                        myFriend.length > 0 ? (
                          myFriend.filter(
                            (usr) => usr._id.$oid === user._id.$oid
                          ).length > 0 ? (
                            <button
                              style={{ cursor: 'default' }} 
                              className='profile-add-link'>
                              Already Friend
                            </button>
                          ):(
                            user.hasOwnProperty('friend_pending') ? (
                              user.friend_pending.filter(
                                (usr) => usr.$id.$oid === ownUser._id.$oid
                              ).length > 0 ? (
                                <>
                                  <Link
                                    to={{
                                pathname: '/profile',
                                state: {
                                  id: user._id.$oid,
                                },
                              }}
                              className='profile-add-link'
                                    onClick={() =>
                                      cancelFrRequest(user._id.$oid)
                                    }
                            
                                  >
                                    Cancel Request
                                  </Link>
                                </>
                              ) : (
                                <>
                                  <Link
                                    to={{
                                pathname: '/profile',
                                state: {
                                  id: user._id.$oid,
                                },
                              }}
                              className='profile-add-link'
                                    onClick={() =>
                                      addFriendRequest(user._id.$oid)
                                    }
                                  >
                                    Add Friend
                                  </Link>
                                </>
                              )
                            ) : (
                              <>
                                <Link
                                  to={{
                                pathname: '/profile',
                                state: {
                                  id: user._id.$oid,
                                },
                              }}
                              className='profile-add-link'
                                  onClick={() =>
                                    sendFriendRequest(user._id.$oid)
                                  }
                                >
                                  Add Friend
                                </Link>
                              </>
                            )
                          )
                        ) : (
                          user.hasOwnProperty('friend_pending') ? (
                              user.friend_pending.filter(
                                (usr) => usr.$id.$oid === ownUser._id.$oid
                              ).length > 0 ? (
                                <>
                                  <Link
                                    to={{
                                pathname: '/profile',
                                state: {
                                  id: user._id.$oid,
                                },
                              }}
                              className='profile-add-link'
                                    onClick={() =>
                                      cancelFrRequest(user._id.$oid)
                                    }
                            
                                  >
                                    Cancel Request
                                  </Link>
                                </>
                              ) : (
                                <>
                                  <Link
                                    to={{
                                pathname: '/profile',
                                state: {
                                  id: user._id.$oid,
                                },
                              }}
                              className='profile-add-link'
                                    onClick={() =>
                                      addFriendRequest(user._id.$oid)
                                    }
                                  >
                                    Add Friend
                                  </Link>
                                </>
                              )
                            ) : (
                              <>
                                <Link
                                  to={{
                                pathname: '/profile',
                                state: {
                                  id: user._id.$oid,
                                },
                              }}
                              className='profile-add-link'
                                  onClick={() =>
                                    sendFriendRequest(user._id.$oid)
                                  }
                                >
                                  Add Friend
                                </Link>
                              </>
                            )
                          )
                      ) : (null)
                    }
                  </div>
                </div>
                <div className='common-card'>
                  <h5>Personal Info</h5>
                  {!isSearch ? (
                    <Link
                      to='/profile'
                      className='pen'
                      data-toggle='modal'
                      data-target='#myModal'
                    >
                      <i className='fas fa-pen'></i>
                    </Link>
                  ) : null}
                  <p>
                    <label>Name</label> {user.name}
                  </p>
                  <p>
                    <label>Email</label> {user.email}
                  </p>
                  <p>
                    <label>Phone</label> {user.phone}
                  </p>
                </div>
                <div className='common-card'>
                  <h5>User Type</h5>
                  {!isSearch ? (
                    <Link
                      to='/profile'
                      className='pen'
                      data-toggle='modal'
                      data-target='#myModal'
                    >
                      <i className='fas fa-pen'></i>
                    </Link>
                  ) : null}
                  <p>
                    <label>User Category</label>
                    {user.user_category}
                  </p>
                  <p>
                    <label>Job</label>
                    {user.job_type}
                  </p>
                  <p>
                    <label>Specialization</label>
                    {user.specialization_type}
                  </p>
                </div>
                <div className='common-card'>
                  <h5>Other Info</h5>
                  {!isSearch ? (
                    <Link
                      to='/profile'
                      className='pen'
                      data-toggle='modal'
                      data-target='#myModal'
                    >
                      <i className='fas fa-pen'></i>
                    </Link>
                  ) : null}
                  <p>
                    <label>Address</label>
                    {user.address}
                  </p>
                  <p>
                    <label>Country</label>
                    {user.country}
                  </p>
                </div>
                { user._id.$oid === otherUserId ? 
                (<div className='common-card'>
                  <h5>User's File</h5>
                  {!isSearch ? (
                    <Link
                      to='/profile'
                      className='pen'
                      data-toggle='modal'
                      data-target='#myModal'
                    >
                      <i className='fas fa-pen'></i>
                    </Link>
                  ) : null}
                  <div className="files-container">
                        {errorMsg && <p className="errorMsg">{errorMsg}</p>}
                        {
                          loading ? <Spinner /> : (
                            <table className="files-table">
                              <thead>
                                <tr>
                                  <th>Type</th>
                                  <th>Title</th>
                                  <th>Description</th>
                                  <th>Actions</th>
                                
                                </tr>
                              </thead>
                              <tbody>
                                {files.length > 0 ? (
                                  files.map(
                                    ({ _id, title, desc, filename, user, file_mimetype }, index) => (
                                      <tr key={index}>
                                        <td className="file-type">
                                          {(filename.split('.').pop() === 'pdf')?(
                                            <i className="fas fa-file-pdf"></i>
                                          ):(
                                            <i className="fas fa-image"></i>
                                          )}
                                        </td>
                                        <td className="file-title">{title}</td>
                                        <td className="file-description">{desc}</td>
                                        <td className="file-actions">
                                          <Link to={`/view/${filename}`} className="profile-action" >
                                            <i className="fas fa-eye"></i>
                                          </Link>
                                        
                                          <Link to="/profile" className="profile-action" onClick={() =>
                                              downloadFile(filename, file_mimetype)
                                            }>
                                            <i className="fas fa-file-download"></i>
                                          </Link>
                                        </td>
                                        
                                      </tr>
                                    )
                                  )
                                ) : (
                                  <tr>
                                    <td colSpan={3} style={{ fontWeight: '300' }}>
                                      No files found. Please add some.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          )
                        }
                          
                      </div>    
                  </div>):null
                }

                <div className='modal fade' id='myModal'>
                  <div className='modal-dialog modal-dialog-centered'>
                    <div className='modal-content'>
                      <form onSubmit={onSubmit}>
                        <div className='modal-header'>
                          <h4 className='modal-title'>Edit Profile</h4>
                          <button
                            type='button'
                            className='close'
                            data-dismiss='modal'
                          >
                            &times;
                          </button>
                        </div>

                        <div className='modal-body'>
                          <fieldset>
                            <legend>Name *</legend>
                            <div className='form-group'>
                              <input
                                type='text'
                                className='form-control'
                                placeholder='Enter First Name'
                                id='firstname'
                                name='firstname'
                                value={firstname}
                                onChange={onChange}
                              />
                            </div>
                            <div className='form-group'>
                              <input
                                type='text'
                                className='form-control'
                                placeholder='Enter Middle Name'
                                id='middlename'
                                name='middlename'
                                value={middlename}
                                onChange={onChange}
                              />
                            </div>
                            <div className='form-group'>
                              <input
                                type='text'
                                className='form-control'
                                placeholder='Enter Last Name'
                                id='lastname'
                                name='lastname'
                                value={lastname}
                                onChange={onChange}
                              />
                            </div>
                          </fieldset>
                          <fieldset>
                            {/* <legend>User Type</legend>
                             <div className='form-group'>
                              <select
                                name='student_type'
                                className='form-control'
                                value={student_type}
                                onChange={onChange}
                              >
                                <option value=''>Select Student</option>
                                <option value='bsc'>BSc.</option>
                                <option value='msc'>MSc</option>
                                <option value='phd'>PhD</option>
                              </select>
                            </div>  */}
                            <div className='form-group'>
                            <label htmlFor='user_category'>User Category</label>
                            <input
                              type='text'
                              className='form-control'
                              placeholder='Enter Educational Qualification'
                              id='user_category' 
                              name='user_category'
                              value={user_category}
                              onChange={onChange}
                              disabled
                            />
                            </div>
                            <div className='form-group'>
                            <label htmlFor='student_type'>Educational Qualification</label>
                            <input
                              type='text'
                              className='form-control'
                              placeholder='Enter Educational Qualification'
                              id='student_type'
                              name='student_type'
                              value={student_type}
                              onChange={onChange}
                            />
                          </div>
                            <div className='form-group'>
                            <label htmlFor='job_type'>Add/Edit Job</label>
                            <input
                              type='text'
                              className='form-control'
                              placeholder='Enter Job'
                              id='job_type'
                              name='job_type'
                              value={job_type}
                              onChange={onChange}
                            />
                          </div>
                            {/* <div className='form-group'>
                              <select
                                name='job_type'
                                className='form-control'
                                value={job_type}
                                onChange={onChange}
                              >
                                <option value=''>Add/Edit Job</option>
                                <option value='job1'>Job 1</option>
                                <option value='job2'>Job 2</option>
                                <option value='job3'>Job 3</option>
                              </select>
                            </div> */}
                            {/* <div className='form-group'>
                              <select
                                name='specialization_type'
                                className='form-control'
                                value={specialization_type}
                                onChange={onChange}
                              >
                                <option value=''>Select Specialization</option>
                                <option value='1'>Option1</option>
                                <option value='2'>Option2</option>
                                <option value='3'>Option3</option>
                              </select>
                            </div> */}
                          </fieldset>
                          
                          <div className='form-group'>
                            <label htmlFor='email'>Email Address *</label>
                            <input
                              type='email'
                              className='form-control'
                              placeholder='Enter email'
                              id='email'
                              name='email'
                              value={email}
                              onChange={onChange}
                            />
                          </div>
                          <div className='form-group'>
                            <label htmlFor='name'>Phone</label>
                            <input
                              type='text'
                              className='form-control'
                              placeholder='Enter Phone'
                              id='phone'
                              name='phone'
                              value={phone}
                              onChange={onChange}
                            />
                          </div>
                          <div className='form-group'>
                            <label htmlFor='name'>Address</label>
                            <input
                              type='text'
                              className='form-control'
                              placeholder='Enter Address'
                              id='address'
                              name='address'
                              value={address}
                              onChange={onChange}
                            />
                          </div>
                      
                          <div className='form-group'>
                            <label htmlFor='name'>Profile Picture:</label>
                            <input
                              type='file'
                              className='custom-select-input'
                              id='exampleFormControlFile1'
                              accept='image/*'
                              onChange={imageHandler}
                            />
                            <div
                              id='modal-profile-picture'
                              className='text-center'
                            >
                              <img
                                src={showImageFlag === true ? viewImage :  IMAGEURL+image}
                                alt='profile'
                              />
                            </div>
                        </div>
                        {/*
                          <fieldset>
                            <legend>Referred By *</legend>
                            <div className='form-group'>
                              <input
                                type='text'
                                className='form-control'
                                placeholder='Enter Name'
                                name='referrer_name'
                                value={referrer_name}
                                onChange={onChange}
                              />
                            </div>
                            <div className='form-group'>
                              <input
                                type='email'
                                className='form-control'
                                placeholder='Enter Email'
                                name='referrer_email'
                                value={referrer_email}
                                onChange={onChange}
                              />
                            </div>
                        </fieldset>
                          */}
                          <Alert />
                        </div>

                        <div className='modal-footer'>
                          <button
                            className='btn btn-danger'
                            type='button'
                            data-dismiss='modal'
                          >
                            Close
                          </button>
                          <button type='submit' className='btn btn-secondary'>
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <Advertisement />
            </div>
          </div>
        </Fragment>
      ) : (
        <Spinner />
      )
   
  );
};
ProfilePage.propTypes = {
  auth: PropTypes.object.isRequired,
  updateProfile: PropTypes.func.isRequired,
  loadUser: PropTypes.func.isRequired,
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  file: state.file,
  friend: state.friend
});
export default connect(mapStateToProps, { 
                    getAllUsers,
                    sendFriendRequest,
                    cancelFriendRequest,
                    loadUser,
                    updateProfile,
                    getFile})
(ProfilePage);
