import React, { Fragment,useState,useEffect } from 'react'
import RectangleSlider from '../advertisement/ImageSlider';
import SquareSlider from '../advertisement/SquareSlider';
import Alert from '../layout/Alert';
import { useForm } from "react-hook-form";
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { uploadAdvertise, getAdvertise } from '../../actions/file';
import Compress from "browser-image-compression";
const ADMIN = process.env.REACT_APP_ADMIN;


const Advertisement = ({uploadAdvertise,getAdvertise,auth:{user}, file:{advertise}}) => {
    useEffect(() => {
        getAdvertise();
      }, [getAdvertise]);
    const { register, handleSubmit, errors, getValues } = useForm({
        mode: 'onTouched',
    });
    const {advertisement_type} = getValues();
    const [file, setFile] = useState('');
    const [image, setImage] = useState('../../img/user-profile.png');
    const registerOptions = {
        advertisement_type: {required: "Advertisement Category is required"}
    }
    let squareAdvertise = [], rectangleAdvertise = [];
    if(advertise.length > 0) {
        //console.log('Calling advertisement');
        rectangleAdvertise = advertise.filter(adv => adv.advertisement_type === "Large");
        squareAdvertise = advertise.filter(adv => adv.advertisement_type === "Small");
    }
    const onSubmit = async () => {
        //console.log('Ad data = ', data);
        if(file){
            const form_data = new FormData();
            form_data.append('file',file);
            //form_data.append('image',image);
            form_data.append('advertisement_type', advertisement_type);
            console.log(advertisement_type);
            uploadAdvertise(form_data);
        } else {
            alert('Please select a advertisement to add.');
        }
    };

    function processfile(blob, options) {
        // read the files
        var reader = new FileReader();
        reader.readAsArrayBuffer(blob);
        var resized;
        reader.onload = function (event) {
          // blob stuff
          var blob = new Blob([event.target.result]); // create blob...
          window.URL = window.URL || window.webkitURL;
          var blobURL = window.URL.createObjectURL(blob); // and get it's URL
          
          // helper Image object
          var image = new Image();
          image.src = blobURL;
          image.onload = function() {
            // have to wait till it's loaded
            resized = resizeMe(image, options); // resized image url
            setImage(resized);
            //console.log('Resize image = ', resized);
          }
        };
        // console.log('Resize image = ', resized);
        // return resized;
    }
    
    // === RESIZE ====
    
    function resizeMe(img, options) {
      
      var canvas = document.createElement('canvas');
    
      var width = img.width;
      var height = img.height;
    
      // calculate the width and height, constraining the proportions
      if (width > height) {
        if (width > options.maxWidth) {
          //height *= max_width / width;
          height = Math.round(height *= options.maxWidth / width);
          width = options.maxWidth;
        }
      } else {
        if (height > options.max_height) {
          //width *= max_height / height;
          width = Math.round(width *= options.max_height / height);
          height = options.max_height;
        }
      }
      
      // resize the canvas and draw the image data into it
      canvas.width = width;
      canvas.height = height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      
      return canvas.toDataURL("image/jpeg",0.5); // get the data from canvas as 70% JPG (can be also PNG, etc.)
      
      // you can get BLOB too by using canvas.toBlob(blob => {});
    
    }
    const imageHandler = async (e) => {
        //setFile(e.target.files[0]);
        var fileUpload = e.target.files[0];
        //var convertedBlobFile;
        const options = {
            //maxSizeMB: 1.5,
            maxWidth: 300, // the max width of the output image, defaults to 1920px
            maxHeight: 300, // the max height of the output image, defaults to 1920px
            resize: true,
            useWebWorker: true
        }
        
        const reader = new FileReader();
        reader.onload = async () =>{
            if(reader.readyState === 2){
                try{
                    const compressedFile = await Compress(fileUpload, options)
                    // console.log(`originalFile size ${fileUpload.size / 1024/ 1024 } MB`);
                    // console.log(compressedFile);
                    // console.log(`compressFile size ${compressedFile.size / 1024 / 1024 } MB`);
                    const convertedBlobFile = new File([compressedFile], fileUpload.name, { type: fileUpload.type, lastModified: Date.now()})
                    //console.log(convertedBlobFile);
                    setFile(convertedBlobFile)
                    processfile(compressedFile, options);
                    //setImage(reader.result);
                }
                catch(e){
                    // Show the user a toast message or notification that something went wrong while compressing file
                    alert('File size must be less than 20MB');
                    console.log('Error in compress = ',e);
                }
            }
        }
        if(fileUpload) reader.readAsDataURL(fileUpload)
    };
    return (
        <Fragment>
            <div className="col-sm-12 col-md-6 col-lg-3">
                <div className="card shadow mb-4">
                    <div className="card-header py-3">
                        
                    </div>
                    <div id="advertisements" className="card-body">
                       
                        <div className="advertisement">
                        { rectangleAdvertise.length > 0 ? (
                            <RectangleSlider advertise={rectangleAdvertise}/>
                            ): null    
                        }
                        {
                            user !== null ? user.email === ADMIN ? (
                                <div style={{marginTop:"10px"}}>
                                    <button className="btn btn-primary" data-toggle="modal" data-target="#adModal">Add Adv</button>
                                    <Link to="/showadvertise" className="btn btn-primary text-right">Show Adv</Link>
                                </div>
                            ): null : null
                        }
                           
                        </div>
                          
                        
                       
                        <div className="video-advert">
                            <i className="fas fa-video" style={{ fontSize:"180px"}}></i>
                            {/* <div style={{marginTop:"10px"}}>
                                <button className="btn btn-primary" data-toggle="modal" data-target="#adModal">Add Adv</button>
                                <button className="btn btn-primary text-right">Show Adv</button>
                            </div>  */}
                        </div>
                        
                        <div className="small-advert">
                        { squareAdvertise.length > 0 ? (
                            <SquareSlider advertise={squareAdvertise}/>
                            ) : null
                        }
                        {
                           user !== null ? user.email === ADMIN ? (
                                <div style={{marginTop:"10px"}}>
                                    <button className="btn btn-primary" data-toggle="modal" data-target="#adModal">Add Adv</button>
                                    <Link to="/showadvertise" className="btn btn-primary text-right">Show Adv</Link>
                                </div> 
                            ): null : null
                        }
                            
                        </div>
                       
                        
                    </div>
                </div>
            </div>
            <div className="modal fade" id="adModal">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-header">
                                <h4 className="modal-title">Advertisement</h4>
                                <button type="button" className="close" data-dismiss="modal">&times;</button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="name">Add an Advertisement:</label>
                                    <input type="file" className="custom-select-input" 
                                            id="exampleFormControlFile1" accept="image/*"
                                            onChange={imageHandler}
                                    />
                                    <div id="modal-profile-picture" className="text-center">
                                        <img src={image} alt="profile" />
                                    </div>
                                </div>                         
                                <div className="form-group">
                                    <label>Advertisement Type:</label>
                                    <select name="advertisement_type" className="form-control"
                                            ref={register(registerOptions.advertisement_type)}
                                    >
                                        <option value="">Select Advertisement Type</option>
                                        <option value="Large">Large Image</option>
                                        <option value="Small">Small Image</option>
                                    </select>
                                </div>
                                {errors.advertisement_type && <span className="text-danger">{errors.advertisement_type.message}</span>}                   
                                <Alert />
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-danger" type="button" data-dismiss="modal">Close</button>
                                <button type="submit" className="btn btn-secondary">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
const mapStateToProps = (state) => ({
    auth: state.auth,
    file: state.file
  });
export default connect(mapStateToProps, {uploadAdvertise, getAdvertise})(Advertisement);
