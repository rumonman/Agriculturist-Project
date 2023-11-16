import React, { Fragment, useEffect, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../../actions/auth';
import { getAllUsers, loadUser } from '../../actions/auth';
import {
  getPendingFrUser,
  getFriendSuggestion,
  getUserMyFr,
} from '../../actions/friends';

import TopSidebar from './TopSidebar';
import PropTypes from 'prop-types';
import { getFile } from '../../actions/file';
const ADMIN = process.env.REACT_APP_ADMIN;
const Dashboard = ({
  props,
  logout,
  getAllUsers,
  getPendingFrUser,
  getFriendSuggestion,
  getUserMyFr,
  loadUser,
  getFile,
  auth: { isAuthenticated, token, user, loading },
}) => {
  const [fileLoading, setFileLoading] = useState(true);
  useEffect(() => {
    console.log('calling useEffect in Dashboard');
    loadUser();
    getAllUsers();
    getPendingFrUser();
    getFriendSuggestion();
    getUserMyFr();
    if(user !== null) {
      if(!loading){
        if (fileLoading && user.email !== ADMIN) {
          console.log('Calling User getFile');
          getFile(user._id.$oid);
          setFileLoading(false)
        }
        else if(fileLoading && user.email === ADMIN){
          //console.log('Calling ADMIN getFile');
          getFile(null);
          setFileLoading(false)
        }
      }
    }
  }, [loadUser, getAllUsers, getPendingFrUser, getUserMyFr, getFile]);
  //console.log('IsAuthenticated', isAuthenticated);
  if (!isAuthenticated && token === null) {
    return <Redirect to='/login' />;
  }
  //console.log(' Props dashboard = ',props);
  return (
    <Fragment>
      <div id='wrapper'>
        <TopSidebar props={props} />
      </div>
      <a className='scroll-to-top rounded' href='#page-top'>
        <i className='fas fa-angle-up'></i>
      </a>

      <div
        className='modal fade'
        id='logoutModal'
        tabIndex='-1'
        role='dialog'
        aria-labelledby='exampleModalLabel'
        aria-hidden='true'
      >
        <div className='modal-dialog' role='document'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title' id='exampleModalLabel'>
                Ready to Leave?
              </h5>
              <button
                className='close'
                type='button'
                data-dismiss='modal'
                aria-label='Close'
              >
                <span aria-hidden='true'>×</span>
              </button>
            </div>
            <div className='modal-body'>
              Select "Logout" below if you are ready to end your current
              session.
            </div>
            <div className='modal-footer'>
              <button
                className='btn btn-secondary'
                type='button'
                data-dismiss='modal'
              >
                Cancel
              </button>
              <Link to='/' className='btn btn-primary' onClick={logout}>
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
Dashboard.propTypes = {
  //setAlert: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});
export default connect(mapStateToProps, {
  logout,
  loadUser,
  getAllUsers,
  getPendingFrUser,
  getFriendSuggestion,
  getUserMyFr,
  getFile
})(Dashboard);
