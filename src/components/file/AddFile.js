import React, { Fragment } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Footer from '../dashboard/Footer';
import Upload from './Upload';
import Topbar from '../dashboard/Topbar';


const AddFile = (props) => {
    
    return (
        <Fragment>
            <div id="wrapper" className="file">
            <Sidebar />
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <Topbar props={props}/>
                        <Upload props={props}/>
                    </div>
                    <Footer />
                </div>
            </div>
        </Fragment>
    )
}
export default AddFile;