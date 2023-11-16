import React, { useState, useRef, Fragment, useEffect } from 'react';
import Dropzone from 'react-dropzone';
// import Sidebar from '../dashboard/Sidebar';
// import Topbar from '../dashboard/Topbar';
// import Footer from '../dashboard/Footer';
import FileHeader from './FileHeader';
import Advertisement from '../dashboard/Advertisement';
import {Redirect, Link} from 'react-router-dom';
import { connect, useDispatch } from 'react-redux';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';
import { addFile, getFile,updateFile } from '../../actions/file';
import Spinner from '../layout/Spinner';
// import Alert from '../layout/Alert';
// import { updateProfile } from '../../actions/auth';
const ADMIN = process.env.REACT_APP_ADMIN;

const initialState = {
  title : '',
  desc : '',
  filename: ''
}
const Upload = ({props, addFile,getFile,updateFile,auth, file: {files, isSuccess,loading}}) => {
  const dispatch = useDispatch();
  const [submitButtonDisable, setSubmitButtonDisable] = useState(false);
  const [file, setFile] = useState(null); // state for storing actual image
  const [previewSrc, setPreviewSrc] = useState(''); // state for storing previewImage
  const [fileData, setFileData] = useState(initialState);
  const [errorMsg, setErrorMsg] = useState('');
  const [fileLoading, setFileLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [filePostID, setFilePostID] = useState(null);
  //const [isPreviewAvailable, setIsPreviewAvailable] = useState(false); // state to show preview only for images
  const dropRef = useRef(); // React ref for managing the hover state of droppable area
  const propsFromLink = props.location.state;
  let {id, edit} = propsFromLink;
  let filteredFile;
  useEffect(() => {
    if (edit) {
        //getPost(id);
        setIsEdit(true);
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
        filteredFile = files.filter((fl) => fl._id.$oid === id)
        filteredFile = Object.assign({}, filteredFile[0]);
        setFilePostID(filteredFile['postID']);
        //console.log('filtered file ',filePostID);
        // console.log('filtered id ',id);
    } 
    if (!loading && filteredFile) {
      const fileData = { ...initialState };
      for (const key in filteredFile) {
        if (key in fileData) {
          fileData[key] = filteredFile[key];
        }
      }
      setFileData(fileData);
      //console.log('file data ', fileData);
    }
  },[loading,files, props]);
  let { title, desc, filename } = fileData;
  //console.log('Loading in upload = ', loading);
  const handleInputChange = (event) => {
    setFileData({
      ...fileData,
      [event.target.name]: event.target.value
    });
  };

  const onDrop = (files) => {
    const [uploadedFile] = files;
    setFile(uploadedFile);
    setIsEdit(false);
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewSrc(fileReader.result);
    };
    fileReader.readAsDataURL(uploadedFile);
    //setIsPreviewAvailable(uploadedFile.name.match(/\.(jpeg|jpg|png)$/));
    dropRef.current.style.border = '2px dashed #e9ebeb';
  };

  const updateBorder = (dragState) => {
    if (dragState === 'over') {
      dropRef.current.style.border = '2px solid #000';
    } else if (dragState === 'leave') {
      dropRef.current.style.border = '2px dashed #e9ebeb';
    }
  };

  const handleOnSubmit = async (event) => {
    event.preventDefault(); 
    setSubmitButtonDisable(true);
    try {
      const { title, desc, filename } = fileData;
      if (title.trim() !== '' && desc.trim() !== '') {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('desc', desc);
        formData.append('filename', filename);
        if(edit) {
          
          if (file) {
            formData.append('file', file);
          }
          
          setErrorMsg('');
          
          await dispatch(updateFile({formData},id, filePostID.$oid));
          
          props.history.push('/dashboard');
          setSubmitButtonDisable(false);
        }
        else {
          if (file) {
            formData.append('file', file);  
            setErrorMsg(''); 
            await dispatch(addFile({formData},id));
            
            props.history.push('/dashboard');
            setSubmitButtonDisable(false);
          } 
          else {
            setErrorMsg('Please select a file.');
          }
        }
        
      } else {
        setErrorMsg('Please enter all the field values.');
      }
    } catch (error) {
      error.response && setErrorMsg(error.response.data);
      setSubmitButtonDisable(false);
    }
    
  };
  if(isSuccess) {
    return <Redirect to = "/dashboard" />;
  } 
  return loading ? (
      <Spinner />
  ) : (
    <Fragment>   
      <Container>
        <div className="row">
          <div className="col-sm-12 col-md-6 col-lg-9">
            <FileHeader />
            <Form className="search-form" onSubmit={handleOnSubmit}>
                {errorMsg && <p className="errorMsg">{errorMsg}</p>}
                <Row>
                  <Col>
                    <Form.Group controlId="title">
                      <Form.Control
                        type="text"
                        name="title"
                        value={title || ''}
                        placeholder="Enter title"
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group controlId="desc">
                    <Form.Control
                      type="text"
                      name="desc"
                      value={desc || ''}
                      placeholder="Enter description"
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <div className="upload-section">
                <Dropzone
                  onDrop={onDrop}
                  onDragEnter={() => updateBorder('over')}
                  onDragLeave={() => updateBorder('leave')}
                  accept="image/*, application/pdf"
                  maxFiles={1}
                >
                  {({ getRootProps, getInputProps }) => (
                    <div {...getRootProps({ className: 'drop-zone' })} ref={dropRef}>
                      <input {...getInputProps()} />
                      <p>Click here OR drag and drop to select a pdf file or image</p>
                      {file && (
                              <div>
                                <strong>Selected file:</strong> {file.name}
                              </div>
                      )}
                        {
                          isEdit ? (
                            <div>
                              <strong>Selected file:</strong> {filename}
                            </div>
                          ): null
                            
      
                        }
                    </div>
                  )}
                </Dropzone>
                {/* {previewSrc ? (
                  isPreviewAvailable ? (
                    <div className="image-preview">
                      <img className="preview-image" src={previewSrc} alt="Preview" />
                    </div>
                  ) : (
                    <div className="preview-message">
                      <p>No preview available for this file</p>
                    </div>
                  )
                ) : (
                  <div className="preview-message">
                    <p>Image preview will be shown here after selection</p>
                  </div>
                )} */}
              </div>
              {
                edit ? (
                  <div className='update-file-btn'>
                      <Button variant="primary" disabled={submitButtonDisable} type="submit">
                          Update
                      </Button>
                      <Link to='/dashboard'
                            className='btn btn-danger'
                      >
                          Cancel
                      </Link>
                  </div>
                  ):(
                        <Button variant="primary" disabled={submitButtonDisable} type="submit">
                            Submit
                        </Button>
                      )
              }
              
            </Form>
          </div>
          <Advertisement />
        </div>
        
      </Container>
     
  </Fragment>
    
  )
}
const mapStateToProps = (state) => ({
  file: state.file,
  auth: state.auth
});
export default connect(mapStateToProps, {addFile, getFile, updateFile})(Upload);
