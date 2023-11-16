import React, { Component, Fragment} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteComment, updateComment } from '../../actions/post';
const ADMIN = process.env.REACT_APP_ADMIN;
const IMAGEURL = process.env.REACT_APP_CLOUDINARY;
//import Alert from '../layout/Alert';

class CommentItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false
        };
    }
    
    renderCommentRead = () => {
        return(
            <span>
                {this.props.comment.cmntBody}
            </span>
        );
    }
    onSubmit =(e) => {
        e.preventDefault();
        this.props.updateComment(this.props.postId, this.props.comment._id.$oid, this.refs.editText.value );
        this.setState({
            editMode: false
        });
        
    }
    // handleTextChange = (e) => {
    //     this.setState({cmntBody: e.target.value});
    // }
    renderCommentEdit = () => {
        return (
            <form className="comment-edit"
                  onSubmit={this.onSubmit}
            >
                <div className="form-group">
                    <textarea name="cmntBody"
                              placeholder="Enter your comment"
                              ref="editText"
                              required
                    >
                    {this.props.comment.cmntBody} 
                    </textarea>
                </div>
                <div className="form-group text-right update-file-btn">
                    <button className="btn btn-primary text-right">Update</button>
                    <button className="btn btn-danger text-right" onClick={()=>this.enterEditMode()}>Cancel</button>
                </div>
            </form>
        );
    }
    enterEditMode = () => {
        if (!this.state.editMode){
            this.setState({
              editMode: true
            });
        }
        else {
            this.setState({
                editMode: false
              });
        }
    }
    render() {
        //console.log("Comment List = ", this.props.comment);
        return (
            <Fragment>
                <div className="card-body">
                    <div className="comment">
                        {
                            this.props.comment !== null ? <img src={IMAGEURL+this.props.comment.user.image} alt="user" /> : null
                        }
                        {this.state.editMode ? this.renderCommentEdit() : this.renderCommentRead()}
                    </div>
                    {(this.props.user !== null )?(this.props.user._id.$oid === this.props.comment.user.userId.$oid) || (this.props.user.email === ADMIN) ? 
                        <div className="text-right edit-delete">
                        <small>
                                <i className="fas fa-pen"></i>
                                <Link to={`/post/${this.props.postId}`} 
                                    onClick={()=>this.enterEditMode()} 
                                >
                                    edit
                                </Link>
                            </small>
                            <small>
                                <i className="fa fa-trash" aria-hidden="true"></i>
                                <Link to={`/post/${this.props.postId}`} onClick={()=>this.props.deleteComment(this.props.postId, this.props.comment._id.$oid)}>
                                    delete
                                </Link>
                            </small>
                        </div> : null : null
                    }
                </div>
            </Fragment>
        )
    }
    
}
CommentItem.propTypes = {
    postId: PropTypes.string.isRequired,
    comment: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    post: PropTypes.object.isRequired,
    deleteComment: PropTypes.func.isRequired,
    updateComment: PropTypes.func.isRequired
};
const mapStateToProps = (state) => ({
    auth: state.auth,
    post: state.post
});
  
export default connect(mapStateToProps, { deleteComment, updateComment })(CommentItem);