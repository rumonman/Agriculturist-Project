import React, {Fragment} from 'react'
import Sidebar from '../dashboard/Sidebar';
import Footer from '../dashboard/Footer';
import Topbar from '../dashboard/Topbar';
import Alert from '../layout/Alert';
import UserList from './UserList';
const UserListContainer = (props) => {
    return (
        <Fragment>
            <div id="wrapper">
            <Sidebar />
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <Topbar props={props}/>
                        <Alert />
                        <UserList />
                    </div>
                    <Footer />
                </div>
            </div> 
        </Fragment>
    )
}

export default UserListContainer
