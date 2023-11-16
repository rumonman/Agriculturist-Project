import React, { Component } from 'react';
import '../css/login.css';
import '../css/responsive.css';
export class ImageUpload extends Component {
    state = {
        image: '../../img/user-profile.png'
    }
    //const [image, setImage] = useState('../../img/profile-picture.png');
    imageHandler = (e) => {
        const reader = new FileReader();
        reader.onload = () =>{
          if(reader.readyState === 2){
            this.setState({image: reader.result})
          }
        }
        reader.readAsDataURL(e.target.files[0])
        
      };
    
    render() {
        const { image } = this.state
        console.log("Image = ", image);
    return (
        <div className="form-wrapper">
         <form id="registration-form">
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
                                        onChange={this.imageHandler}
                                    />
                                </div>
                                <div className="full-row">
                                    <a href="">Remove Image</a>
                                </div>
                            </div>
                        </div>
                    </div>     
         </form>
            
        </div>
    )
    }
}
export default ImageUpload;
