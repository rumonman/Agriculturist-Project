import React, { useState, Fragment } from "react";
import axios from "axios";
//import { FormGroup } from "reactstrap";
import {Link} from 'react-router-dom';
const API = process.env.REACT_APP_API;

export const Registration = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        pwd: ''
      });
    const [status, setStatus] = useState('');
    const { name, email, pwd } = formData;
    
    const onChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });
    
   /* handleChange = event => {
        this.setState({ [event.target.name]: event.target.value });
        this.setState({ [event.target.email]: event.target.value });
        this.setState({ [event.target.pwd]: event.target.value });
    }*/
    const onSubmit = async (event) => {
        event.preventDefault();
        let data = {
            name,
            email,
            pwd
        };
        const res = await axios.post(`${API}/add`, data);
        console.log(res);
        console.log(res.data.result.message);       
        if (res.data.result.message === "user_added_successfully") {
            setStatus("Registration Successful");
            setFormData({
                name: '',
                email: '',
                pwd: ''
              })
        }
    }
    
    return (
        <Fragment>
            <h1 className="large text-primary">Sign Up</h1>
            <p className="lead">
                <i className="fas fa-user" /> Create Your Account
            </p>
            <form className="form" onSubmit={onSubmit}>
                <div className="form-group">
                <input
                    type="text"
                    placeholder="Name"
                    name="name"
                    value={name}
                    onChange={onChange}
                />
                </div>
                <div className="form-group">
                <input
                    type="email"
                    placeholder="Email Address"
                    name="email"
                    value={email}
                    onChange={onChange}
                />
                <small className="form-text">
                    This site uses Gravatar so if you want a profile image, use a
                    Gravatar email
                </small>
                </div>
                <div className="form-group">
                <input
                    type="password"
                    placeholder="Password"
                    name="pwd"
                    value={pwd}
                    onChange={onChange}
                />
                </div>
                
                <input type="submit" className="btn btn-primary" value="Register" />
            </form>
            <p className="my-1">
                Already have an account? <Link to="/login">Sign In</Link>
            </p>
            <h2 style={{ marginLeft: "477px" }} >{status}</h2>
        </Fragment>
    )
}
