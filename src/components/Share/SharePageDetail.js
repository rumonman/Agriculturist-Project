import React, { Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import { getSharePost } from '../../actions/post';
import formatDate from '../../utils/formatDate';
import PropTypes from 'prop-types';
import Advertisement from '../dashboard/Advertisement';
// import CommentForm from './CommentForm';
// import CommentItem from './CommentItem'; 
import Spinner from '../layout/Spinner';
import Alert from '../layout/Alert';
const SharePageDetail = ({getSharePost, post:{sharepost, loading}, match}) => {
    useEffect(() => {
        getSharePost(match.params.id);
    }, [getSharePost, match.params.id]);
    console.log("sharepostDetail = ", sharepost);
    //console.log("postDetail postId = ",post._id.$oid);
    return loading || sharepost === null ? (
        <Spinner />
      ) : (
        <Fragment>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12 col-md-8 col-lg-9">
                        <div className="card-body shadow mb-4">
                            <h3>{sharepost.title}</h3>
                            <div className="post-info">
                                <small><i className="fa fa-calendar"></i>Publish Date: {formatDate(sharepost.date.$date)}</small>
                                <small><i className="fa fa-user"></i>Author: {sharepost.user.status}</small>
                            </div>
                            <div id="post-details">
                                <p>
                                {sharepost.desc}
                                </p>
                            </div>
                        </div>
                        {/* <div className="card-body shadow mb-4">
                            <h3>Comments</h3>
                            <CommentForm postId={post._id.$oid}/>
                            <Alert />
                            <div id="comments">
                                {sharepost.comments !== null ? (sharepost.comments.map((comment) => (
                                    <CommentItem key={comment._id.$oid} user={user} comment={comment} postId={sharepost._id.$oid} />
                                ))): null }
                            
                            </div>
                        </div> */}
                    </div>
                    <Advertisement />
                </div>
            </div>
           
        </Fragment>
    )
}
SharePageDetail.propTypes = {
    getPost: PropTypes.func.isRequired,
    post: PropTypes.object.isRequired
  };
  
const mapStateToProps = (state) => ({
    post : state.post
});
export default connect(mapStateToProps, { getSharePost })(SharePageDetail);


