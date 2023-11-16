import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { addComment } from '../../actions/post';

const CommentForm = ({addComment, postId, props}) => {
    //console.log('In CommentForm = ',postId);
    const [cmntBody, setcmntBody] = useState('');
    return (
        <Fragment>
            <form className="comment-form"
                  onSubmit={e => {
                    e.preventDefault();
                    addComment(postId, { cmntBody });
                    setcmntBody('');
                    }}
            >
                <div className="form-group">
                    <textarea name="cmntBody" rows="3" 
                              placeholder="Enter your comment" 
                              value={cmntBody}
                              onChange={e => setcmntBody(e.target.value)}
                              required
                    />
                   
                </div>
                <div className="form-group text-right">
                    <button className="btn btn-primary">Submit</button>
                </div>
            </form>
        </Fragment>
    )
}
CommentForm.propTypes = {
    addComment: PropTypes.func.isRequired
};
export default connect(null, {addComment})(CommentForm);