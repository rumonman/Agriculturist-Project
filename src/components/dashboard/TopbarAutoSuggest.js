import React, { Fragment, useState, useRef, useEffect } from 'react'
import { connect } from 'react-redux';
//import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import {Link} from 'react-router-dom';
import { logout } from '../../actions/auth';
const TopbarAutoSuggest = ({auth:{user, allUsers}, logout}) => {
    const [search_data, setSearch_data] = useState('');
    const [searchUser, setSearchUser] = useState([]);
    const [display, setDisplay] = useState(false);
    const wrapperRef = useRef(null);
    //var users = [];
    //const toggle = () => setDisplay(!display);
    useEffect(() => {
        setSearchUser(allUsers);
        window.addEventListener("mousedown", handleClickOutside);
        return () => {
          window.removeEventListener("mousedown", handleClickOutside);
        };
      },[allUsers]);
    
      const handleClickOutside = event => {
        const { current: wrap } = wrapperRef;
        if (wrap && !wrap.contains(event.target)) {
          setDisplay(false);
        }
      };
    
    //   const updatePokeDex = poke => {
    //     setSearch_data(poke);
    //     setDisplay(false);
    //   };
    const editSearch= (e) => {
        setSearch_data(e.target.value);
        //const value = e.target.value;
        let users = [];
        console.log('====================================');
        console.log(search_data);
        console.log('====================================');
        if(search_data.length > 0) {
            // const regex = new RegExp(`^${value}`, 'i');
            // users = allUsers.sort().filter(v => regex.test(v));
            users = allUsers.filter(users => users.name.toLowerCase().includes(search_data.toLowerCase()))
        }
        //users = allUsers.filter((user ) => user.name.toLowerCase().indexOf(search_data.toLowerCase()) > -1)
        //users = allUsers.filter(users => users.name.toLowerCase().includes(search_data.toLowerCase()))   
        console.log('UserList = ', users);
        setSearchUser(users);
        setDisplay(true);
        //onClick={() => setDisplay(!display)}
    }
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
                
                    <form className="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search"
                            onSubmit={e => {
                                e.preventDefault();
                                setSearch_data('');
                            }}
                    >
                        <div className="input-group">
                            <input type="search" 
                                className="form-control bg-light border-0 small" 
                                placeholder="Search for..."
                                value={search_data}
                                onChange={editSearch}
                                aria-autocomplete="list" 
                                autoComplete="false"
                                aria-invalid="false"
                                aria-label="Search" aria-describedby="basic-addon2" />
                            <div className="input-group-append">
                                <button className="btn btn-primary" type="submit">
                                        <i className="fas fa-search fa-sm"></i>
                                </button>
                            </div>
                        </div>  
                    </form>
                    {display && (
                    <div ref={wrapperRef} aria-busy="false" className="suggestion-container">
                        <ul className="autoContainer" role="grid">
                            {searchUser
                            .map((value, i) => {
                                    return (
                                        <li
                                            aria-selected="false"
                                            onClick={() => {
                                                setSearch_data('');
                                                setDisplay(false);
                                                }}
                                            className="option"
                                            key={i}
                                            tabIndex="0"
                                            role="row"
                                        >
                                            <Link to={{
                                                pathname: '/profile',
                                                state: {
                                                    id: value._id.$oid
                                                }}} 
                                               >
                                                    {value.name}
                                            </Link>
            
                                        </li>
                                    );
                                })}
                            </ul>
                      
                    </div>   )}
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
                        <a href="#" className="nav-link dropdown-toggle" 
                            id="userDropdown" role="button"
                            data-toggle="dropdown" aria-haspopup="true" 
                            aria-expanded="false">
                                <span className="mr-2 d-none d-lg-inline text-gray-600 small">
                                    {user !== null ? user.name : 'UserName'} </span>
                                <img className="img-profile rounded-circle"
                                    src={user !== null ? user.image : null}
                                    alt="userName"
                                />
                        </a>
                        <div className="dropdown-menu dropdown-menu-right 
                                    shadow animated--grow-in"
                             aria-labelledby="userDropdown">
                            <Link  className="dropdown-item" to="/profile">
                                <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                                    Profile
                            </Link>
                            <div className="dropdown-divider">

                            </div>
                            <a href="" className="dropdown-item" 
                                data-toggle="modal" data-target="#logoutModal">
                                    <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                                    Logout
                            </a>
                        </div>
                    </li>
                </ul>
                
            </nav>
            {/* {searchUser.length > 0 ? 
                        <ListGroup className="list-group">
                            {searchUser.map(user=>(<ListGroupItem key={user.key}><Link to="/profile">{user.name}</Link></ListGroupItem>))}
                        </ListGroup> : null
                    } */}
            <div className="modal fade" id="logoutModal" tabIndex="-1" 
                role="dialog" aria-labelledby="exampleModalLabel"
                aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
                            <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body">Select "Logout" below if you are ready to end your current session.
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                            <Link to="/" className="btn btn-primary" onClick={logout} >
                                Logout
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* <div>
                <Modal isOpen={display} toggle={toggle} className="suggestion-container">
                    <ModalHeader toggle={toggle}>Users List</ModalHeader>
                    <ModalBody>
                        hello
                    </ModalBody>
                </Modal>
            </div>  */}
        </Fragment>
    )
}
const mapStateToProps = (state) => ({
    auth: state.auth
});
export default connect(mapStateToProps, {logout})(TopbarAutoSuggest);
