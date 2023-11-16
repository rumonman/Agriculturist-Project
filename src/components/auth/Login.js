import React, { Fragment } from 'react';
//import {Alert} from 'reactstrap';
//import axios from 'axios';
import { connect } from 'react-redux';
//import { bindActionCreators } from 'redux';
import { Link, Redirect} from 'react-router-dom';
//import { setAlert } from '../../actions/alert';
import { login } from '../../actions/auth';
import PropTypes from 'prop-types';
import Alert from '../layout/Alert';
import { useForm } from "react-hook-form";

const Login = ({auth:{isAuthenticated, token}, login}) => {
    const { register, handleSubmit, errors, getValues } = useForm({
        mode: 'onTouched',
        });
    const { email, password } = '';
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
    const onSubmit = async () => {
        const { email, password } = getValues();
        // console.log('Email ',email);
        // console.log('pass', password );
        login(email, password);
        //reset();
        //console.log('IsAuthenticated = ', isAuthenticated);
        
    };
    if (isAuthenticated && token !== null) {
        return <Redirect to={{
            pathname: '/dashboard',
            state: {
                showMyPost: false
            }
        }} />;
    }
    return (
        <Fragment>
            <div className="form-wrapper auth">
		        <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="text-center">	
                        <img src={process.env.PUBLIC_URL + '/img/Agriculturist-logo_150x191.png'} alt="logo" />
                        <h2>
                            <span>Login to Agriculturist</span>
                        </h2>
                    </div> 
                    {/* <h2>
                        <span>Log in to Agriculturist</span>
                    </h2> */}
                   
                    <input type="text" 
                            name="email" 
                            placeholder="Enter Email"
                            ref={register(registerOptions.email)}/>
                     {errors.email && <span className="text-danger">{errors.email.message}</span>}
                    <input type="password" 
                            name="password" 
                            placeholder="Enter Password"
                            ref={register(registerOptions.password)} />
                    {errors.password && <span className="text-danger">{errors.password.message}</span>}
                    <button>Login</button>
                    <span>Not a user? <Link to="/register">Register Here</Link></span>
                    <span><Link to="/forgotpassword">Forgot Password?</Link></span>
                    <Alert />
		        </form>
	        </div>
        </Fragment>
    )
}
Login.propTypes = {
    //setAlert: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
  };
  
const mapStateToProps = (state) => ({
    auth: state.auth
});

export default connect(mapStateToProps, { login })(Login);
