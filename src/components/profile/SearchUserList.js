import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Spinner from '../layout/Spinner';
import Advertisement from '../dashboard/Advertisement';
import { getAllUsers } from '../../actions/auth';
const IMAGEURL = process.env.REACT_APP_CLOUDINARY;

const SearchUserList = ({props,getAllUsers, auth:{allUsers, loading} }) => {
    useEffect(() => {
        //console.log('calling useEffect of SearchUserList');
        if(allUsers.length < 1){
            getAllUsers();
        }
        if(props.location.state ) {
            //setDisplayedUser(allUsers);
            var searchQuery = props.location.state.value.toLowerCase();
            var userList = allUsers.filter(function(user) {
                var searchValue = user.name.toLowerCase();
                return searchValue.indexOf(searchQuery) !== -1;
              });
            // console.log('UserList ', userList);
            // console.log('Value ', searchQuery);
            setDisplayedUser(userList);
            //setIsSearchComplete(false);
        }
       
      }, [getAllUsers, props.location.state, allUsers]);
    const [displayedUser, setDisplayedUser] = useState([]);
    
    return (
        <Fragment>
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-12 col-md-6 col-lg-9'>
                        <div className='card shadow mb-4'>
                            <div className='card-header py-3'>
                                <h6 className='m-0 font-weight-bold text-primary'>Searched User</h6>
                            </div>
                            {displayedUser.length > 0 ? (
                            displayedUser.map((userFr) => (
                            <Fragment key={userFr._id.$oid}>
                                <div
                                    id='posts-list'
                                    className='card-body friendCard'
                                >
                                    <div className='post-card card'>
                                        <div className='row'>
                                            <div className='col-sm-12 col-md-4 col-lg-4'>
                                                <img
                                                src={IMAGEURL+userFr.image}
                                                alt='User'
                                                className='friendImageProfile'
                                                />
                                            </div>
                                            <div className='col-sm-12 col-md-8 col-lg-8'>
                                                <Link
                                                    to={{
                                                        pathname: '/profile',
                                                        state: {
                                                        id: userFr._id.$oid,
                                                        },
                                                    }}
                                                    
                                                >
                                                    <h4 style={{
                                                        paddingTop: 15,
                                                        paddingBottom: 0,
                                                    }}>{userFr.name}</h4>
                                                </Link>
                                                <h6 style={{
                                                    paddingLeft: 8,
                                                }}>
                                                   User Type {': '} {userFr.user_category}
                                                </h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Fragment>
                            ))
                         ) : (
                            <p
                            style={{
                                paddingLeft: 20,
                                paddingTop: 10,
                                fontWeight: 'bold',
                            }}
                            >
                            No user is matched. Search again with exact keyword....
                            </p>
                            )}
                        </div>
                    </div>
                    <Advertisement />
                </div>
            </div>
        </Fragment>
    )
}
const mapStateToProps = (state) => ({
    auth: state.auth
  });
export default connect(mapStateToProps, { getAllUsers})(
    SearchUserList
  );

