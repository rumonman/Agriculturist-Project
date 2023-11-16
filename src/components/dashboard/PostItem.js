import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import formatDate from '../../utils/formatDate';
import { FacebookShareButton, LinkedinShareButton } from "react-share";
import { FacebookIcon, LinkedinIcon} from "react-share";
import ShareModal from './ShareModal';
import PostDeleteModal from './PostDeleteModal';
import FilePostDeleteModal from './FilePostDeleteModal';
import {Image} from 'cloudinary-react';

const IMAGEURL = process.env.REACT_APP_CLOUDINARY;
const ADMIN = process.env.REACT_APP_ADMIN;


const PostItem = ({index, deletePost,deleteFile, postOwner, post:{_id, title, desc,filename,fileID, date,user}}) => {
    //console.log('Id in postItem', _id);
    const [deleteId, setDeleteId] = useState(null);
    
    const [fileDeleteId, setFileDeleteId] = useState(null);
    const [postBody, setPostBody] = useState({
        id: null,
        desc: "",
        title: ""
    });
    const url = "https://agriculturist.org/";
    const [show, setshow] = useState(false);
    
    const [fileDeletemodalshow, setFileDeletemodalshow] = useState(false); 
    const [deletemodalshow, setDeletemodalshow] = useState(false); 
    
    //Set ID for delete
    const filePostDeleteId = (id, fID) => {
        //console.log('Dellete id ',id);
        setDeleteId(id);
        setFileDeleteId(fID);
        setFileDeletemodalshow(true);
        //console.log('deletemodalshow', deletemodalshow);
    }
    const postDeleteId = (id) => {
        //console.log('Dellete id ',id);
        setDeleteId(id);
        setDeletemodalshow(true);
        //console.log('deletemodalshow', deletemodalshow);
    }
    const postBodyFunc = (id, desc, title) => {
        setPostBody({
            id: id,
            desc:desc,
            title:title
        });
        setshow(true);
    }
    const handleClose = () => {
   
        setshow(false);
        setDeletemodalshow(false);
        setFileDeletemodalshow(false);
        
      };
    
      const [isReadPostTitleMore, setIsReadPostTitleMore] = useState(true);
      const toggleReadTitleMore = (data) => {
        setIsReadPostTitleMore(data);
      };
      const [isReadDescMore, setIsReadDescMore] = useState(null);
      const toggleReadMore = (data) => {
        setIsReadDescMore(data);
        //console.log('toggle data',data);
      };
    return (
    <>
        <div className="card-body">
            <h5><Link to={`/post/${_id.$oid}`}>
            {
                title.length > 160 ? title.slice(0, 161): title
            }
                </Link>
            {
                title.length > 160 ? <span style={{paddingLeft:3}}>....</span> : null
            }
            </h5>
            <p>
            {isReadDescMore === index ? desc : desc.slice(0, 300)}
            {desc.length > 300 ? (
                <>
                <span style={{padding:5}}>.....</span>
                <Link to={`/post/${_id.$oid}`} className="read-more-button">
                            Read more
                </Link>
                </> 
                
            ) : null }
            </p>
            {
                filename !== 'null' ? (
                    <div>
                        <Link to={`/view/${filename}`}>
                            <div className='post-card card file-post'>
                            {
                                ( filename.split('.').pop() === 'pdf' ) ? (
                                    <div className='row'>
                                    <div className='col-lg-2 col-sm-3'>
                                    <img className='file-post-icon' src={process.env.PUBLIC_URL + '/img/pdfIcon.png'} alt="PDF FILE"/>
                                    </div>
                                    <div className='col-lg-10 col-sm-9'>
                                        <p className='file-post-title'>
                                        {
                                            title.length > 60 ? title.slice(0, 67): title
                                        }
                                        {
                                            title.length > 60 ? <span style={{paddingLeft:3}}>....</span> : null
                                        }
                                        </p>
                                    </div>
                                    </div>
                                ) : (
                                    <div className='row'>
                                        <Image className="image-file-post" cloudName="daf1cgy1c" publicId={IMAGEURL+filename}/>
                                        {/* <div className='col-lg-2 col-sm-3'>
                                            <img className='file-post-icon' src={process.env.PUBLIC_URL + '/img/postImageIcon.png'} alt="IMAGE FILE"/>
                                        </div>
                                        <div className='col-lg-10 col-sm-9'>
                                            <h6 className='file-post-header'>
                                            IMAGE
                                            </h6>
                                            <p className='file-post-title'>{filename}</p>
                                        </div> */}
                                    </div>
                                )
                            }
                                
                            </div>
                        </Link>
                    </div>
                ): null
            }
            
            <div>
                <small><i className="fa fa-calendar"></i>
                    Publish Date: {formatDate(date.$date)}
                </small>
                <small><i className="fa fa-user"></i>
                    Author: {user.status}
                </small>
                <small><i className="fa fa-comments"></i>
                    <Link to={`/post/${_id.$oid}`}>
                        comment
                    </Link>
                </small>
                <small><i className="fas fa-share"></i>
                    <Link to="/dashboard" 
                          onClick={()=>postBodyFunc(_id.$oid, desc, title)}
                    >
                        share
                    </Link>
                </small>
                {postOwner._id.$oid === user.userId.$oid || postOwner.email === ADMIN ? (
                    <small>
                    {
                        filename === 'null' ? (
                            <>
                            <i className="fas fa-pen"></i>
                            <Link to={{
                                pathname: '/addpost',
                                state: {
                                    id: _id.$oid,
                                    edit: true
                                }
                            }}>
                                edit
                            </Link>
                            </>
                        ) : (
                            <>
                            <i className="fas fa-pen"></i>
                            <Link to={{
                                        pathname: '/addfile',
                                        state: {
                                                    id: fileID.$oid,
                                                    edit:true
                                                },
                                    }}>
                                edit
                            </Link>
                            </>
                        )
                    }
                    </small>
                ):null }
                { postOwner._id.$oid === user.userId.$oid || postOwner.email === ADMIN ?
                (<small>
                    {
                        filename === 'null' ? (
                            <>
                            <i className="fa fa-trash" aria-hidden="true"></i>
                            <Link to="/dashboard"
                                onClick={()=>postDeleteId(_id.$oid)}>
                                delete
                            </Link>
                            </>
                        ):(
                            <>
                            <i className="fa fa-trash" aria-hidden="true"></i>
                            <Link to="/dashboard"
                                onClick={()=>filePostDeleteId(_id.$oid, fileID.$oid)}>
                                delete
                            </Link>
                            </>
                            
                        )
                    }
                    
                </small> ): null}
            </div>
        </div>
        {/* <div className="modal fade" id="postDeleteModal" tabIndex="-1" 
                role="dialog" aria-labelledby="exampleModalLabel"
                aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Delete Post</h5>
                        <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">×</span>
                        </button>
                    </div>
                    <div className="modal-body">Do you really want to delete the Post?</div>
                    <div className="modal-footer">
                    <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                    <Link to="/dashboard" className="btn btn-primary" 
                          onClick={() => deletePost(deleteId)} data-dismiss="modal"
                    >
                        Delete
                    </Link>
                    </div>
                </div>
                </div>
        </div> */}
        <ShareModal
          show={show}
          data={postBody}
          onClick={handleClose}
          onHide={handleClose} />
        
        <PostDeleteModal
          show={deletemodalshow}
          deleteId={deleteId}
          onClick={handleClose}
          onHide={handleClose}
          deletePost = {deletePost}
          />
        <FilePostDeleteModal
          show={fileDeletemodalshow}
          deleteId={deleteId}
          fileDeleteId = {fileDeleteId}
          onClick={handleClose}
          onHide={handleClose}
          deletePost = {deletePost}
          deleteFile = {deleteFile} />
        
                           
    </>
    )
}
export default PostItem;