import React, {useState} from 'react';
import { OtpInput } from 'react-otp-input';
import axios from 'axios';
//import Redirect from 'react-router-dom';
//import dashboard from '/dashboard.js';
const API = process.env.REACT_APP_API;
export const OTP = () => {
    const [otp, setOtp] = useState('');
    const handleChange = (e) => setOtp({ [e.target.name]: e.target.value });
    try {
        const res = axios.post(`${API}/otp_verify`, otp);
        console.log(res);
        if(res.otp === otp){
            <h2>OTP Matched</h2>
        }
    } catch (error) {
        console.log(error.response.data);
        <h2>OTP is not Matched</h2>
    }
  /*axios.post(`http://127.0.0.1:5000/otp`, otp)
            .then(res => {
                console.log(res);
                if (res.otp === this.state.otp) {
                    <Redirect to='dashboard.js'/>
                }
            })*/

    return (
      <div>
        <OtpInput
          onChange={handleChange}
          numInputs={6}
          separator={<span>-</span>}
        />
      </div>
    );
}