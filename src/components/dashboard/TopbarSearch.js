import React, { Fragment, useState } from 'react'
import { connect } from 'react-redux';
import {Link, Redirect} from 'react-router-dom';
import { searchUserData } from '../../actions/auth';
const Topbar = ({auth:{user, isSearch}, searchUserData}) => {
    const [search_user, setSearchUser] = useState('');
    console.log("User in Topbar = ", user);
    const searchDataSubmit = async (e) => {
        e.preventDefault();
        if(search_user === '') alert('Please give data for searching')
        searchUserData({search_user})
        return (<Redirect to={{
            pathname: '/profile',
            state: {
                searchView: true
            }}} />);
    }
    // if(isSearch) {
    //     return (<Redirect to={{
    //         pathname: '/profile',
    //         state: {
    //             searchView: true
    //         }}} />);
    // }
    return (
        <Fragment>
            <nav className="navbar navbar-expand navbar-light 
                        bg-white topbar mb-4 static-top shadow">
                <button id="sidebarToggleTop" 
                        className="btn btn-link d-md-none rounded-circle mr-3">
                    <i className="fa fa-bars"></i>
                </button>

                <div className="dropdown">
                    <a className="btn dropdown-toggle" href="#" role="button" 
                       id="dropdownMenuLink" data-toggle="dropdown" 
                       aria-haspopup="true" aria-expanded="false">
                            Applications
                    </a>
                    <div className="dropdown-menu dropdown-menu-left shadow animated--fade-in"
                         aria-labelledby="dropdownMenuLink">
                        <a className="dropdown-item" href="#">Pages</a>
                        <a className="dropdown-item" href="#">Groups</a>
                    </div>
                </div>

                <form className="navbar-search"
                      onSubmit={searchDataSubmit}
                >
                    <div className="input-group">
                        <input type="text" 
                               className="form-control bg-light border-0 small" 
                               placeholder="Search for..." 
                               value={search_user}
                               onChange={e => setSearchUser(e.target.value)}
                               aria-label="Search" aria-describedby="basic-addon2" />
                        <div className="input-group-append">
                            <button className="btn btn-primary" type="submit">
                                <i className="fas fa-search fa-sm"></i>
                            </button>
                        </div>
                    </div>
                </form>

                <ul className="navbar-nav ml-auto">  
                    <li className="nav-item dropdown no-arrow d-sm-none">
                        <a className="nav-link dropdown-toggle" href="#" 
                            id="searchDropdown" role="button"
                            data-toggle="dropdown" aria-haspopup="true" 
                            aria-expanded="false">
                                <i className="fas fa-search fa-fw"></i>
                        </a>
                        <div className="dropdown-menu dropdown-menu-right p-3 
                                    shadow animated--grow-in"
                              aria-labelledby="searchDropdown">
                            <form className="form-inline mr-auto w-100 navbar-search">
                                <div className="input-group">
                                    <input type="text" 
                                           className="form-control bg-light border-0 small"
                                           placeholder="Search for..." aria-label="Search"
                                           aria-describedby="basic-addon2" />
                                    <div className="input-group-append">
                                        <button className="btn btn-primary" type="button">
                                            <i className="fas fa-search fa-sm"></i>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </li>

                    <li className="nav-item dropdown no-arrow mx-1">
                        <a className="nav-link dropdown-toggle" href="" 
                           id="alertsDropdown" role="button"
                           data-toggle="dropdown" aria-haspopup="true" 
                           aria-expanded="false">
                                <i className="fas fa-bell fa-fw"></i>
                                <span className="badge badge-danger badge-counter"></span>
                        </a>
                    </li>

                    <li className="nav-item dropdown no-arrow mx-1">
                        <a  className="nav-link dropdown-toggle" href="" 
                            id="messagesDropdown" role="button"
                            data-toggle="dropdown" aria-haspopup="true" 
                            aria-expanded="false">
                                <i className="fas fa-envelope fa-fw"></i>
                                <span className="badge badge-danger badge-counter">
                                </span>
                        </a>
                    </li>

                    <div className="topbar-divider d-none d-sm-block">

                    </div>

                    <li className="nav-item dropdown no-arrow">
                        <Link className="nav-link dropdown-toggle" 
                            id="userDropdown" role="button"
                            data-toggle="dropdown" aria-haspopup="true" 
                            aria-expanded="false">
                                <span className="mr-2 d-none d-lg-inline text-gray-600 small">
                                    {user !== null ? user.name : 'UserName'} </span>
                                <img className="img-profile rounded-circle"
                                    src={user !== null ? user.image : null}
                                    alt="userName"
                                />
                        </Link>
                        <div className="dropdown-menu dropdown-menu-right 
                                    shadow animated--grow-in"
                             aria-labelledby="userDropdown">
                            <Link  className="dropdown-item" to={{
                                    pathname: '/profile',
                                    state: {
                                        searchView: false
                                    }}}>
                                <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                                    Profile
                            </Link>
                            <div className="dropdown-divider">

                            </div>
                            <Link className="dropdown-item" 
                                data-toggle="modal" data-target="#logoutModal">
                                    <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                                    Logout
                            </Link>
                        </div>
                    </li>
                </ul>
            </nav>
        </Fragment>
    )
}
const mapStateToProps = (state) => ({
    auth: state.auth
});
export default connect(mapStateToProps, {searchUserData})(Topbar);
