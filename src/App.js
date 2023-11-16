import React, { Fragment, useEffect } from 'react';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import HomePage from './components/dashboard/HomePage';
import PostDetail from './components/posts/PostDetail';
import Posts from './components/posts/Posts';
import AddPost from './components/posts/AddPost';
import PrivateRoute from './components/routing/PrivateRoute';
import FileHome from './components/file/FileHome';
import AddFile from './components/file/AddFile';
import FilesListContainer from './components/file/FilesListContainer';
import FileViewContainer from './components/file/FileViewContainer';
import Profile from './components/profile/Profile';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ProfileSearchView from './components/profile/ProfileSearchView';
import ShowAdvertise from './components/dashboard/ShowAdvertise';
import UserListContainer from './components/auth/UserListContainer';
import AddFriend from './components/Friends/AddFriend';
import FriendListContainer from './components/Friends/FriendListContainer';
import SearchUserListContainer from './components/profile/SearchUserListContainer';
import store from './store';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import { loadUser } from './actions/auth';
import SharePage from './components/Share/SharePage';
import PrivacyPolicy from './components/Share/PrivacyPolicy';

const App = () => {
  useEffect(() => {
    console.log('calling useEffect');
    store.dispatch(loadUser());
    //store.dispatch(getPendingFrUser);
  }, []);
  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Route exact path="/" component={ Login } />
            <Switch>
              <Route exact path="/register" component={ Register } />
              <Route exact path="/dashboard" component={ HomePage } />
              <Route exact path="/login" component={ Login } />
              <Route exact path="/forgotpassword" component={ ForgotPassword } />
              <Route exact path="/resetpassword" component={ ResetPassword } />
              <PrivateRoute exact path="/postdetail" component={ PostDetail } />
              <PrivateRoute exact path="/post/:id" component={ Posts } />
              <Route exact path="/addpost" component={ AddPost } />
              <Route exact path="/file" component={ FileHome } />
              <Route exact path="/addfile" component={AddFile}  />
              <Route exact path="/list" component={FilesListContainer}  />
              <Route exact path="/view/:filename" component={FileViewContainer}  />
              <Route exact path="/profile" render={(props) => <Profile {...props}/>}  />
              <Route exact path="/search" component={ProfileSearchView}  />
              <Route exact path="/showadvertise" component={ShowAdvertise}  />
              <Route exact path="/userlist" component={UserListContainer}  />
              <Route exact path="/friends" component = {AddFriend} />
              <Route exact path="/friendlist" component = {FriendListContainer} />
              <Route exact path="/sharepost/:id" component = {SharePage} />
              <Route exact path="/searchuser" render={(props) => <SearchUserListContainer {...props}/>} />
              <Route exact path="/privacypolicy" component = {PrivacyPolicy} />
            </Switch> 
          
        </Fragment>

      </Router>
    </Provider>
  );
}

export default App;
