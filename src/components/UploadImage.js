import React, { useState } from 'react';
import {Alert} from 'reactstrap';
import axios from 'axios';

const API = process.env.REACT_APP_API;
const UploadImage = () => {
    const [file, setFile] = useState('');
    //const [filename, setFilename] = useState('');
    const [image, setImage] = useState('../../img/user-profile.png');
    const [fileimg, setFileimg] = useState('');
    const [formData, setFormData] = useState({
        firstname:'',
        middlename:''
    })
    const { firstname, middlename } = formData;
    const onChange = (e) =>
          setFormData({ ...formData, [e.target.name]: e.target.value });
    const imageHandler = (e) => {
        
        setFile(e.target.files[0]);
        //setFilename(e.target.files[0].name);
        const reader = new FileReader();
        reader.onload = () =>{
          if(reader.readyState === 2){
            setImage( reader.result)
          }
        }
        const urlFile = reader.readAsDataURL(e.target.files[0])
        console.log('URL = ',urlFile);
       
      };
      const getFormData = object => Object.keys(object).reduce((formData, key) => {
        formData.append(key, object[key]);
        return formData;
      }, new FormData());
      const onSubmit = async e => {
        e.preventDefault();
        const form_data = getFormData(formData);

        // for ( var key in formData ) {
        //   form_data.append(key, formData[key]);
        // }
        //form_data.append('data', formData);
        form_data.append('image', image);
        //form_data.append('file', file);
        //form_data.append('filename', filename);
        
        try {
          // const res = await axios.post(`${API}/file_upload`, form_data);
    
          // const { fileName } = res.data;
          
          // //setUploadedFile({ fileName, filePath });
          // <Alert>{res.data.result.message}</Alert>
          //setMessage('File Uploaded');
          const resFile = await axios.get(`${API}/getfile`);
          const dataFile = JSON.parse(resFile.data.data);
          console.log('Get Response File = ', dataFile[0].name );
          setFileimg(dataFile[0].image)
          //setFileimg(res.data)
        } catch (err) {
          if (err) {
            <Alert>There was a problem with the server</Alert>;
          } else {
            <Alert>{err.response.data.msg}</Alert>;
          }
        }
      };
    return (
        <div className="form-wrapper">
            <form id="registration-form" onSubmit={onSubmit}>
                <div className="flex-inline items-3 widthDiv">		
                        <label>Name: *</label>	
                        <div className="flex-inline widthDiv">
                            <input type="text" 
                                    name="firstname" 
                                    placeholder="Enter First Name"
                                    value={firstname}
                                    onChange={onChange}  />
                            <input type="text"
                                   name="middlename" 
                                   placeholder="Enter Middle Name"
                                   value={middlename}
                                   onChange={onChange} />
                        </div>
                </div>
                <div className="flex-inline">
                       <label>Profile Picture:</label>
                       <div id="registration-image">
                           <div id="registration-image-container">
                               <div className="full-row">
                                   <img src={image} alt="profile" />
                               </div>
                               <div className="full-row">
                                   <input type="file" 
                                       name="profile_picture" 
                                       className="customFileInput"
                                       onChange={imageHandler}
                                   />
                               </div>
                               <div className="full-row">
                                   <a href="/#">Remove Image</a>
                               </div>
                               <div className="full-row">
                                   <img src={fileimg} alt="profile" />
                               </div>
                           </div>
                       </div>
                </div>
                <input
                    type='submit'
                    value='Upload'
                    className='btn btn-primary btn-block mt-4'
                />    
            </form>
           
       </div>
    )
}
export default UploadImage;