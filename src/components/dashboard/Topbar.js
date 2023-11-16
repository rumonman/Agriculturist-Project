import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
//import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { Link, Redirect } from 'react-router-dom';
import { logout, toggleCssClass } from '../../actions/auth';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';
const IMAGEURL = process.env.REACT_APP_CLOUDINARY;

const Topbar = ({props, auth: { user, allUsers }, 
  friend: {pendingFriend},
  logout, toggleCssClass }) => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [addClass, setAddClass] = useState(true);
  const toggleClass = () => {
    //console.log('Tobbar addclass before set ', addClass);

    setAddClass(!addClass);
    toggleCssClass(addClass);
    //console.log('Tobbar addclass after set ', addClass);
  };
 
  function escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  function getSuggestions(value) {
    const escapedValue = escapeRegexCharacters(value.trim());

    if (escapedValue === '') {
      return [];
    }

    const regex = new RegExp('\\b' + escapedValue, 'i');

    return allUsers.filter((user) => regex.test(getSuggestionValue(user)));
  }

  function getSuggestionValue(suggestion) {
    return `${suggestion.firstname} ${suggestion.middlename} ${suggestion.lastname}`;
  }

  function renderSuggestion(suggestion, { query }) {
    // console.log('Sugestion ', suggestion);
    // console.log('Query ', query);
    const suggestionText = `${suggestion.firstname} ${suggestion.middlename} ${suggestion.lastname}`;
    const matches = AutosuggestHighlightMatch(suggestionText, query);
    const parts = AutosuggestHighlightParse(suggestionText, matches);
    return (
      <span className='suggestion-content'>
        <img
          src={IMAGEURL+suggestion.image}
          alt='user'
          className='user-img-profile rounded-circle'
        />
        <span className='name'>
          <Link
            to={{
              pathname: '/profile',
              state: {
                id: suggestion._id.$oid,
              },
            }}
          >
            {parts.map((part, index) => {
              const className = part.highlight ? 'highlight' : null;
              return (
                <span className={className} key={index}>
                  {part.text}
                </span>
              );
            })}
          </Link>
        </span>
      </span>
    );
  }
  const onChange = (event, { newValue, method }) => {
    setValue(newValue);
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
    //console.log('Suggestions list ', suggestions);
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const submitSearchData = async (e) => {
    e.preventDefault();
    // let userArrayData = allUsers.filter(
    //   (user) => user.name.toLowerCase() === value.toLowerCase()
    // );
    // //console.log('User in search = ', userArrayData)
    // let userData = Object.assign({}, userArrayData[0]);
    // //console.log('User in search = ', userData)
    // if (value === '') alert('User input search data is not given');
    // if (userArrayData.length > 0) {
      
    //   props.history.push('/profile',{
    //     id: userData._id.$oid,
    //   });
    //   // return (
    //   //   <Redirect
    //   //     to={{
    //   //       pathname: '/profile',
    //   //       state: {
    //   //         id: userData._id.$oid,
    //   //       },
    //   //     }}
    //   //   />
    //   // );
    // } else 
    if (value !== '') {
        props.history.push('/searchuser',{
          value: value,
        });
    }
  };
  
  const inputProps = {
    placeholder: 'Search for...',
    value,
    onChange: onChange,
  };
  
  return (
    <Fragment>
     
        
          <nav
        className='navbar navbar-expand navbar-light 
                    bg-white topbar mb-4 static-top shadow'
      >
       {
      user !== null ? (
        <>
        <button
          id='sidebarToggleTop'
          onClick={toggleClass}
          className='btn btn-link d-md-none rounded-circle mr-3'
        >
          <i className='fa fa-bars'></i>
        </button>

        {/* <div id='dashboard-header-dropdown' className='dropdown'>
          <a
            className='btn dropdown-toggle'
            href='/#'
            role='button'
            id='dropdownMenuLink'
            data-toggle='dropdown'
            aria-haspopup='true'
            aria-expanded='false'
          >
            Applications
          </a>
          <div
            className='dropdown-menu dropdown-menu-left shadow animated--fade-in'
            aria-labelledby='dropdownMenuLink'
          >
            <Link
              className='dropdown-item'
              to={{
                pathname: '/dashboard',
                state: {
                  showMyPost: false,
                },
              }}
            >
              Pages
            </Link>
            <Link
              className='dropdown-item'
              to={{
                pathname: '/dashboard',
                state: {
                  showMyPost: false,
                },
              }}
            >
              Groups
            </Link>
          </div>
        </div> */}

        <form
          className='d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search'
          onSubmit={submitSearchData}
        >
          <div className='input-group'>
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              inputProps={inputProps}
            />
            <div className='input-group-append'>
              <button className='btn btn-primary' type='submit'>
                <i className='fas fa-search fa-sm'></i>
              </button>
            </div>
          </div>
        </form>

        <ul className='navbar-nav ml-auto'>
          <li className='nav-item dropdown no-arrow d-sm-none'>
            <a
              className='nav-link dropdown-toggle'
              href='/#'
              id='searchDropdown'
              role='button'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='false'
            >
              <i className='fas fa-search fa-fw'></i>
            </a>
            <div
              className='dropdown-menu dropdown-menu-right p-3 
                                    shadow animated--grow-in'
              aria-labelledby='searchDropdown'
            >
              <form
                className='form-inline mr-auto w-100 navbar-search'
                onSubmit={submitSearchData}
              >
                <div className='input-group'>
                  <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    inputProps={inputProps}
                  />
                  <div className='input-group-append'>
                    <button className='btn btn-primary' type='submit'>
                      <i className='fas fa-search fa-sm'></i>
                    </button>
                  </div>
                  {/* <input type="text" 
                                        className="form-control bg-light border-0 small"
                                        placeholder="Search for..." aria-label="Search"
                                        aria-describedby="basic-addon2" /> */}
                </div>
              </form>
            </div>
          </li>

          <li className='nav-item dropdown no-arrow mx-1'>
            <a
              className='nav-link dropdown-toggle'
              href='/#'
              id='alertsDropdown'
              role='button'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='false'
            >
              <i className='fas fa-bell fa-fw'></i>
              <span className='badge badge-danger badge-counter'>
                {pendingFriend.length > 0 ? pendingFriend.length : null}
              </span>
            </a>
            {pendingFriend.length > 0 ? (
              <div
                className='dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in'
                aria-labelledby='alertsDropdown'
              >
                <h6 className='dropdown-header'>Notification Center</h6>
                {pendingFriend.length > 0
                  ? pendingFriend.map((pendingUser) => (
                      <Link
                        key={pendingUser._id.$oid}
                        className='dropdown-item d-flex align-items-center'
                        to='/friends'
                      >
                        <div className='mr-3'>
                          <div className='icon-circle bg-primary'>
                            <img
                              className='img-profile rounded-circle'
                              src={
                                pendingUser !== null ? IMAGEURL+pendingUser.image : null
                              }
                              alt={pendingUser.name}
                            />
                          </div>
                        </div>
                        <div>
                          <span className='font-weight-bold'>
                            <span
                              style={{
                                fontSize: 15,
                                fontWeight: 'bold',
                                fontFamily: 'cursive',
                                color: 'green'
                              }}
                            >
                              {pendingUser.name}
                            </span>{' '}
                            wants to be your friend.
                          </span>
                        </div>
                      </Link>
                    ))
                  : null}
              </div>
            ) : null}
          </li>

          {/* <li className='nav-item dropdown no-arrow mx-1'>
            <a
              className='nav-link dropdown-toggle'
              href='/#'
              id='messagesDropdown'
              role='button'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='false'
            >
              <i className='fas fa-envelope fa-fw'></i>
              <span className='badge badge-danger badge-counter'></span>
            </a>
          </li> */}

          <div className='topbar-divider d-none d-sm-block'></div>

          <li className='nav-item dropdown no-arrow'>
            <a
              href='/#'
              className='nav-link dropdown-toggle'
              id='userDropdown'
              role='button'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='false'
            >
              <span className='mr-2 d-none d-lg-inline text-gray-600 small'>
                {user !== null ? user.name : 'UserName'}{' '}
              </span>
              <img
                className='img-profile rounded-circle'
                src={user !== null ? IMAGEURL+user.image : null}
                alt='userName'
              />
            </a>
            <div
              className='dropdown-menu dropdown-menu-right 
                                    shadow animated--grow-in'
              aria-labelledby='userDropdown'
            >
              <Link className='dropdown-item' to='/profile'>
                <i className='fas fa-user fa-sm fa-fw mr-2 text-gray-400'></i>
                Profile
              </Link>
              <div className='dropdown-divider'></div>
              <a
                href='/#'
                className='dropdown-item'
                data-toggle='modal'
                data-target='#logoutModal'
              >
                <i className='fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400'></i>
                Logout
              </a>
            </div>
          </li>
        </ul>
        </>
        ) : (
          
            <div className="not-user">
              <span>Not a user? <Link to="/register">Register Here</Link></span>
            </div>
          
        )
        
      }
      </nav>
        


      {/* {searchUser.length > 0 ? 
                        <ListGroup className="list-group">
                            {searchUser.map(user=>(<ListGroupItem key={user.key}><Link to="/profile">{user.name}</Link></ListGroupItem>))}
                        </ListGroup> : null
                    } */}
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
const mapStateToProps = (state) => ({
  auth: state.auth,
  friend: state.friend
});
export default connect(mapStateToProps, { logout, toggleCssClass })(Topbar);
