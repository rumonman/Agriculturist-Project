import React, { Fragment, useState } from 'react';
import axios from 'axios';
import { Link, Redirect} from 'react-router-dom';
const API = process.env.REACT_APP_API;

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const config = {
        headers : {
            'Content-Type':'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        if(email === '') alert('Email is required')
        else {
            try {
                const res = await axios.post(`${API}/forgotPassword`, {email}, config);
                console.log('Forgot Password response', res.data.data);
                let msg = JSON.stringify(res.data.result.message)
                if(res.data.result.isError === 'true') {
                    console.log(msg);
                    alert(msg)
                }
                else {
                    alert(msg)
                    return <Redirect to="/" />;
                }
              } catch (err) {
                //const errors = err.response;
                alert(err)
                console.log('Error in forgetPassword = ',err);
            }
        }
    };
    return (
        <Fragment>
            <div className="form-wrapper auth">
		        <form onSubmit={onSubmit}>
                    <h2>
                        <i className="fa fa-lock"></i>
                        <span>Forgot Password</span>
                    </h2>
                    <input type="text" 
                            name="email" 
                            placeholder="Enter Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)} required/>
                    
                    <button>Send Email</button>
                    <Link to="/login"><button>Back</button></Link>
		        </form>
                
	        </div>
        </Fragment>
    )
}

export default ForgotPassword;
