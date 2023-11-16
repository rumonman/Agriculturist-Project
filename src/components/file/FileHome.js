import React, {Fragment} from 'react';
import Sidebar from '../dashboard/Sidebar';
import Topbar from '../dashboard/Topbar';
import Footer from '../dashboard/Footer';

import FileHeader from './FileHeader';

import { Container } from 'reactstrap';
import { BrowserRouter as Router } from 'react-router-dom';
function FileHome() {
    return (
        <Fragment>
            <div id="wrapper">
                <Sidebar />
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <Topbar />
                            <Router>
                               <Container>
                                    <FileHeader />
                                    {/* <div className="main-content">
                                        <Switch>
                                        <Route exact path="/upload" component={Upload}  />
                                        <Route exact path="/list" component={FilesList}  />
                                        </Switch>
                                    </div> */}
                                </Container>
                            </Router>
                    </div>
                    <Footer />
                </div>
                
            </div>
        </Fragment>
    )
}

export default FileHome;
