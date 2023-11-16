import React, { Fragment } from 'react'
import Topbar from '../dashboard/Topbar';
import Sidebar from '../dashboard/Sidebar';
import Footer from '../dashboard/Footer';
import SearchUserList from './SearchUserList';
const SearchUserListContainer = (props) => {
    //console.log('Props in profile', props);
    return (
        <Fragment>
            <div id="wrapper">
                <Sidebar />
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <Topbar props={props}/>
                        <SearchUserList props={props}/>
                    </div>
                    <Footer />
                </div>
            </div>
        </Fragment>
    )
}

export default SearchUserListContainer;
