import React, { useState, Fragment, useEffect } from 'react';
import download from 'downloadjs';
import axios from 'axios';
// import Sidebar from '../dashboard/Sidebar';
// import Topbar from '../dashboard/Topbar';
// import Footer from '../dashboard/Footer';
import Spinner from '../layout/Spinner';
import { Container } from 'reactstrap';
import FileHeader from './FileHeader';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { deleteFile, getFile } from '../../actions/file';
import { deletePost } from '../../actions/post';
// import Alert from '../layout/Alert';
import Advertisement from '../dashboard/Advertisement';
const API = process.env.REACT_APP_API;
const ADMIN = process.env.REACT_APP_ADMIN;

const FilesList = ({getFile, deleteFile, deletePost, auth, file:{files, loading}}) => {
  //const [filesList, setFilesList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [postDeleteID, setPostDeleteID] = useState(null);
  const [fileLoading, setFileLoading] = useState(true);
  useEffect(() => {
    console.log('calling filelist useEffect');
    if(auth.user !== null) {
      if(!auth.loading){
        if (fileLoading && auth.user.email !== ADMIN) {
          //console.log('Calling User getFile');
          getFile(auth.user._id.$oid);
          setFileLoading(false)
        }
        else if(fileLoading && auth.user.email === ADMIN){
          //console.log('Calling ADMIN getFile');
          getFile(null);
          setFileLoading(false)
        }
      }
    }
  }, [getFile, auth]);
  //console.log('Loading file',fileLoading);
  // if(auth.user !== null) {
  //   if(!auth.loading){
  //     if (fileLoading && auth.user.email !== ADMIN) {
  //       //console.log('Calling User getFile');
  //       getFile(auth.user._id.$oid);
  //       setFileLoading(false)
  //     }
  //     else if(fileLoading && auth.user.email === ADMIN){
  //       //console.log('Calling ADMIN getFile');
  //       getFile(null);
  //       setFileLoading(false)
  //     }
  //   }
  // }
  const downloadFile = async (filename, mimetype) => {
    try {
      const result = await axios.get(`${API}/file/${filename}`, {
        responseType: 'blob'
      });
      //console.log("File Return Data = ", result.data);
      // const split = path.split('/');
      // const filename = split[split.length - 1];
      setErrorMsg('');
      return download(result.data, filename, mimetype);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrorMsg('Error while downloading file. Try again later');
      }
    }
  };

  //const text = children;
  const [isReadTitleMore, setIsReadTitleMore] = useState(true);
  const toggleReadTitleMore = (data) => {
    setIsReadTitleMore(data);
  };
  const [isReadMore, setIsReadMore] = useState(null);
  const toggleReadMore = (data) => {
    setIsReadMore(data);
    //console.log('toggle data',data);
  };
  //Set ID for delete
  const fileDeleteId = (id, pID) => {
    //console.log('Dellete id ',id);
    setDeleteId(id);
    setPostDeleteID(pID);
  }
  return (
    <Fragment>
        
      <Container>
        <div className="row">
          <div className="col-sm-12 col-md-6 col-lg-9">
            <FileHeader />
            <div className="files-container">
              {errorMsg && <p className="errorMsg">{errorMsg}</p>}
              {
                loading ? <Spinner /> : (
                  <table className="files-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.length > 0 ? (
                        files.map(
                          ({ _id, title, desc,postID, filename, user, file_mimetype }, index) => (
                            <tr key={index}>
                              <td className="file-type">
                                  {(filename.split('.').pop() === 'pdf')?(
                                    <i className="fas fa-file-pdf"></i>
                                  ):(
                                    <i className="fas fa-image"></i>
                                  )}
                              </td>
                              <td className="file-title">
                              {isReadTitleMore === index ? title : title.slice(0, 20)}
                                {title.length > 20 ? (
                                isReadTitleMore === index ? (
                                    <span onClick={()=>toggleReadTitleMore(index+files.length)} className="read-or-hide">
                                    Read less ▲
                                    </span>
                                  ): (
                                    <span onClick={()=>toggleReadTitleMore(index)} className="read-or-hide">
                                    Read more ▼
                                    </span>
                                  )
                                ) : null }
                              </td>
                              <td className="file-description">
                                {isReadMore === index ? desc : desc.slice(0, 50)}
                                {desc.length > 50 ? (
                                  isReadMore === index ? (
                                    <span onClick={()=>toggleReadMore(index+files.length)} className="read-or-hide">
                                    Read less ▲
                                    </span>
                                  ): (
                                    <span onClick={()=>toggleReadMore(index)} className="read-or-hide">
                                    Read more ▼
                                    </span>
                                  )
                                  
                                ) : null }
                                
                              </td>
                              <td className="file-actions">
                                { auth.user._id.$oid === user.userId.$oid || auth.user.email === ADMIN ?
                                  (<Link to={{
                                        pathname: '/addfile',
                                        state: {
                                                    id: _id.$oid,
                                                    edit:true
                                                },
                                      }}
                                      className="action"
                                  >
                                  <i className="fas fa-edit"></i>
                                  </Link>) : null
                                }
                              
                                <Link to={`/view/${filename}`} className="action">
                                  <i className="fas fa-eye"></i>
                                </Link>
                              
                                <Link to="/list" className="action" onClick={() =>
                                    downloadFile(filename, file_mimetype)
                                  }>
                                  <i className="fas fa-file-download"></i>
                                </Link>
                            
                              { auth.user._id.$oid === user.userId.$oid || auth.user.email === ADMIN ?
                                
                                (<a
                                  href='/#'
                                  className='action'
                                  data-toggle='modal'
                                  data-target='#fileDeleteModal'
                                  onClick={() => fileDeleteId(_id.$oid, postID.$oid)}
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </a>):null
                              }
                              </td>
                            </tr>
                          )
                        )
                      ) : (
                        <tr>
                          <td colSpan={3} style={{ fontWeight: '300' }}>
                            No files found. Please add some.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )
              }
            
            </div>       
          </div>
          <Advertisement />
        </div>
          
      </Container>
        <div className="modal fade" id="fileDeleteModal" tabIndex="-1" 
              role="dialog" aria-labelledby="exampleModalLabel"
              aria-hidden="true">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Delete File</h5>
                    <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">×</span>
                    </button>
                </div>
              <div className="modal-body">Do you want to delete the file?</div>
              <div className="modal-footer">
                <button className="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                <Link to="/list" className="btn btn-primary" 
                      onClick={() => {
                        deleteFile(deleteId);
                        deletePost(postDeleteID);
                      }}
                      data-dismiss="modal"
                >
                  Delete
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
  );
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  file: state.file
});
export default connect(mapStateToProps, {getFile, deleteFile, deletePost})(FilesList);