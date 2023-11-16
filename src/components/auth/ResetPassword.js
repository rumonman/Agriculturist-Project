import React, { Fragment, useState } from 'react';
import axios from 'axios';
import { Link, Redirect} from 'react-router-dom';
import { useForm } from "react-hook-form";
const API = process.env.REACT_APP_API;

const ResetPassword = () => {
    const [flag, setFlag] = useState(false)
    const { register, handleSubmit, errors, getValues } = useForm({
        mode: 'onTouched',
        });
    const {email, password, passwordconfirm} = getValues();
    const registerOptions = {
        password: {
            required: "Password is required",
            minLength: {
                value: 6,
                message: "Password must have at least 6 characters"
            }
        },
        email: {
            required: "Email is required",
            pattern: {
                value: /^(([^<>()[\]\\.,;:!*&$#\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,4}))$/,
                message: "Enter a valid e-mail address",
                }
        }
    };
    const config = {
        headers : {
            'Content-Type':'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    };
    const onSubmit = async () => {
        if(password === '' || passwordconfirm === '') alert('Password is required')
        else if(password !== passwordconfirm) alert('Password is not matched')
        else {
            try {
                const res = await axios.post(`${API}/resetPassword`, {email, password,passwordconfirm}, config);
                console.log('Reset Password response', res.data.data);
                let msg = JSON.stringify(res.data.result.message)
                if(res.data.result.isError === 'true') {
                    console.log(msg);
                    setFlag(false);
                    alert(msg);
                }
                else {
                    setFlag(true);
                    alert(msg);
                    
                }
              } catch (err) {
                //const errors = err.response;
                alert(err);
                console.log('Error in resetPassword = ',err);
            }
        }
    };
    if(flag) {
        return <Redirect to="/login" />;
    }
    return (
        <Fragment>
            <div className="form-wrapper auth">
		        <form onSubmit={handleSubmit(onSubmit)}>
                    <h2>
                        <i className="fa fa-lock"></i>
                        <span>Forgot Password</span>
                    </h2>
                    <input type="email" 
                            name="email" 
                            placeholder="Enter Email"
                            ref={register(registerOptions.email)}/>
                    {errors.email && <span className="text-danger">{errors.email.message}</span>}
                    <input type="password" 
                            name="password" 
                            placeholder="Enter Password"
                            ref={register(registerOptions.password)} />
                    {errors.password && <span className="text-danger">{errors.password.message}</span>}
                    <input type="password" 
                            name="passwordconfirm" 
                            placeholder="Enter Confirm Password"
                            ref={register({
                                        required: true, 
                                        validate: value => value === password,
                                   })}/>
                    {errors.passwordconfirm && errors.passwordconfirm.type === 'required' && <span className="text-danger">Confirm Password is required</span>}
                    {errors.passwordconfirm && errors.passwordconfirm.type === 'validate' && <span className="text-danger">Password is not matched</span>}
                    <button>Reset Password</button>
                    <Link to="/login"><button>Back</button></Link>
		        </form>
	        </div>
        </Fragment>
    )
}
export default ResetPassword;
