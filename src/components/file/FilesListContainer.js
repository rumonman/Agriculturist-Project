import React, { Fragment } from 'react';
import FilesList from './FilesList';
import Sidebar from '../dashboard/Sidebar';
import Footer from '../dashboard/Footer';
import Topbar from '../dashboard/Topbar';
import Alert from '../layout/Alert';
const FilesListContainer = (props) => {
    return (
        <Fragment>
           <div id="wrapper">
            <Sidebar />
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <Topbar props={props}/>
                        <Alert />
                        <FilesList />
                    </div>
                    <Footer />
                </div>
            </div> 
        </Fragment>
    )
}

export default FilesListContainer
