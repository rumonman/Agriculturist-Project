import React, { Fragment } from 'react';
import FileView from './FileView';
import Sidebar from '../dashboard/Sidebar';
import Footer from '../dashboard/Footer';
import Topbar from '../dashboard/Topbar';
import Alert from '../layout/Alert';
const FileViewContainer = (props) => {
    return (
        <Fragment>
           <div id="wrapper">
            <Sidebar />
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <Topbar props={props}/>
                        <Alert />
                        <FileView match={props.match}/>
                    </div>
                    <Footer />
                </div>
            </div> 
        </Fragment>
    )
}

export default FileViewContainer
