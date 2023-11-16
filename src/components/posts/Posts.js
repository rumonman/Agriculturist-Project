import React, { Fragment } from 'react';
import PostDetail from './PostDetail';
//import { connect } from 'react-redux';
import Sidebar from '../dashboard/Sidebar';
import Footer from '../dashboard/Footer';
import Topbar from '../dashboard/Topbar';
//import {getPost} from '../../actions/post';
//import PropTypes from 'prop-types';

const Posts = (props) => {
    
    //getPost(match.params.id);
    //console.log(post);
    //console.log('params',match.params.id);
    return (
        <Fragment>
            <div id="wrapper">
                <Sidebar />
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <Topbar props={props}/>
                        <PostDetail match={props.match}/>
                    </div>
                    <Footer />
                </div>
            </div>
        </Fragment>
    )
}
// Posts.propTypes = {
//     getPost: PropTypes.func.isRequired,
//     post: PropTypes.object.isRequired
// };
  
// const mapStateToProps = (state) => ({
//     post : state.post
// });
// export default connect(mapStateToProps, { getPost })(Posts);
export default Posts;