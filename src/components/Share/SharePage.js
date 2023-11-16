
import { Button } from 'react-bootstrap';
import React, { Fragment } from 'react';
import Sidebar from '../dashboard/Sidebar';
import Footer from '../dashboard/Footer';
import Topbar from '../dashboard/Topbar';
import SharePageDetail from './SharePageDetail'; 
const SharePage = (props) => {
    return (
      <Fragment>
            <div id="wrapper">
                <Sidebar />
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <Topbar props={props}/>
                        <SharePageDetail match={props.match}/>
                    </div>
                    <Footer />
                </div>
            </div>
        </Fragment>
    );
}

export default SharePage;








