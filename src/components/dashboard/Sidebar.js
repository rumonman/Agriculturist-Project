import React, { Fragment, useState} from 'react'
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { toggleCssClass } from '../../actions/auth';
const ADMIN = process.env.REACT_APP_ADMIN;
const Sidebar = ({auth:{user, isAddClass}, toggleCssClass}) => {
    //console.log('Toggle', isAddClass);
    const [addClass, setAddClass] = useState(true);
    const toggleClass = () => {
        setAddClass(!addClass);
        toggleCssClass(addClass);
    }
    return (
        <Fragment>
            <ul className={`navbar-nav bgGradientPrimary sidebar sidebar-dark accordion ${isAddClass ? "toggled":""}`} 
                    id="accordionSidebar">
                    
                    <Link to={{
                        pathname: '/dashboard',
                        state: {
                            showMyPost: false
                        }
                    }} id="brand-image">
                        <img src={process.env.PUBLIC_URL + '/img/Agriculturist-logo_150x191.png'} alt="Agriculturist Logo"/>
                        {/* <img src="../../../public/img/Social_Fish2.png" alt="Agriculturist Logo"/> */}
                        <span>Agriculturist</span>
                    </Link> 
                    <hr className="sidebar-divider my-0" />
                    {
                        user !== null ? (
                            <>
                            <li className="nav-item active">
                        <Link className="nav-link collapsed" to={{
                            pathname: '/dashboard',
                            state: {
                                showMyPost: false
                            }
                        }} 
                        // onClick={() => toggleCssClass(true)}
                        >
                            <i className="fas fa-fw fa-tachometer-alt"></i>
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link collapsed" href="/#" data-toggle="collapse" data-target="#collapsePosts"
                            aria-expanded="true" aria-controls="collapsePosts">
                            <i className="fas fa-user-plus" aria-hidden="true"></i>
                            <span>Posts</span> 
                        </a>
                        <div id="collapsePosts" className="collapse" aria-labelledby="headingPages" data-parent="#accordionSidebar">
                            <div className="bg-white py-2 collapse-inner rounded">
                                <Link className="nav-link collapse-item" to={{
                                        pathname: '/addpost',
                                        state: {
                                            id: null,
                                            edit: false
                                        }
                                }} 
                                // onClick={() => toggleCssClass(true)}
                                >Add Post</Link>
                                <Link className="collapse-item" to={{
                                        pathname: '/dashboard',
                                        state: {
                                            showMyPost: true
                                        }
                                }} 
                                // onClick={() => toggleCssClass(true)}
                                >Show MyPost</Link>
                            </div>
                        </div>
                    </li>
                    
                    <li className="nav-item">
                        <a className="nav-link collapsed" href="/#" data-toggle="collapse" data-target="#collapseFiles"
                            aria-expanded="true" aria-controls="collapseFiles">
                            <i className="fas fa-fw fa-folder"></i>
                            <span>Files</span> 
                        </a>
                        <div id="collapseFiles" className="collapse" aria-labelledby="headingPages" data-parent="#accordionSidebar">
                            <div className="bg-white py-2 collapse-inner rounded">
                                <Link className="collapse-item"
                                        to={{
                                            pathname: '/addfile',
                                            state: {
                                                id: null,
                                                edit: false
                                            }
                                        }}
                                >Add File</Link>
                                <Link className="collapse-item" to="/list">Show Files</Link>
                            </div>
                        </div>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link collapsed" href="/#" data-toggle="collapse" data-target="#collapseFriends"
                            aria-expanded="true" aria-controls="collapseFiles">
                            <i className="fas fa-user-friends"></i>
                            <span>Friends</span> 
                        </a>
                        <div id="collapseFriends" className="collapse" aria-labelledby="headingPages" data-parent="#accordionSidebar">
                            <div className="bg-white py-2 collapse-inner rounded">
                                <Link className="collapse-item" to="/friends">Add Friends</Link>
                                <Link className="collapse-item" to="/friendlist">My Friends</Link>
                            </div>
                        </div>
                    </li>
                    {
                    user !== null ? user.email === ADMIN ? (
                        <li className="nav-item">
                            <Link to="/userlist" className="nav-link collapsed">
                                <i className="fa fa-user"></i>
                                <span>UserList</span>
                            </Link>
                        </li>
                    ): null : null
                    }

                    <hr className="sidebar-divider" />

                    <hr className="sidebar-divider d-none d-md-block" />

                    <div className="text-center d-none d-md-inline">
                        <button className="rounded-circle border-0" id="sidebarToggle" onClick={toggleClass}></button>
                    </div>
                    </>
                        ): <div className="not-user"></div>
                    }
                   

                </ul>
        </Fragment>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth
});
export default connect(mapStateToProps, {toggleCssClass})(Sidebar);
