import React, { Fragment, useEffect, useState } from 'react'
//import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import PostItem from './PostItem';
import PropTypes from 'prop-types';
import { getPosts, deletePost } from '../../actions/post';
import { deleteFile } from '../../actions/file';
import Spinner from '../layout/Spinner';
import Advertisement from './Advertisement';

const Pages = ({ getPosts, deletePost,deleteFile, auth:{user}, post: {posts, loading}, props}) => {
    useEffect(() => {
        getPosts();
    }, [getPosts, deletePost]);
    const [mypost, setMypost] = useState(false);
    
    if(props.location.state) {
        //console.log(props.location.state.showMyPost);
        if(props.location.state.showMyPost) {
            
            if(!mypost) setMypost(true);
            posts = posts.filter((post) => user._id.$oid === post.user.userId.$oid)
        }
        else {
            if(mypost) setMypost(false);
        }
    }
    
    return (
        <Fragment>
            <div className="container-fluid">
                <div className="d-sm-flex align-items-center 
                            justify-content-between mb-4">
                    
                    {!mypost ? (<h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
                                ) : (<h1 className="h3 mb-0 text-gray-800">My Posts</h1>)}
                </div>
                
                <div className="row">
                    <div className="col-sm-12 col-md-6 col-lg-9">
                        <div className="card shadow mb-4">
                            <div className="card-header py-3">
                                <h6 className="m-0 font-weight-bold text-primary">
                                    Posts</h6>
                            </div>
                            <div id="posts-list" className="card-body">
                                <div className="post-card card">
                                        {user === null ? (<Spinner />) : (posts.length <= 0 ? (<h5 style={{padding: '10px'}}>You have no post yet</h5>) : (posts.map((post, index) => (
                                            <PostItem key={post._id.$oid} post={post} postOwner={user} deletePost={deletePost} deleteFile={deleteFile} index={index}/> 
                                        )))) }
                                </div>
                            </div>
                        </div>
                    </div>
    
                    <Advertisement />
                </div>
            </div>
            
        </Fragment>
    )
}
Pages.propTypes = {
    //setAlert: PropTypes.func.isRequired,
    getPosts: PropTypes.func.isRequired,
    deletePost: PropTypes.func.isRequired,
    isSuccess: PropTypes.bool
  };
  
const mapStateToProps = (state) => ({
    post : state.post,
    auth: state.auth
});
export default connect(mapStateToProps, { getPosts, deletePost, deleteFile })(Pages); 
