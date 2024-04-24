/**
 * @fileoverview LoginForm.jsx
 * This component renders the page in which it is 
 * possible to login after compiling login form.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import axios from 'axios';
import './LoginForm.css';

/******** Component Definition  *************************************************/

/**
 * LoginForm
 * This component renders the text areas that can be used to input
 * a new login with already existing users. It also has the new registration
 * option as a button that will redirect to SignUpForm component.
 * @returns Instantiation of the elements that contain the login form.
 */

const LoginForm = () => {

    const [isError, setIsError] = useState(false);
    const [loginForm, setLoginForm] = useState( 
            {
                email: '', 
                password: '',
            }
    );
    /**
     * handleOnChange
     * This function just collects all the input parameters and fills the formData
     * accordingly, also checking their value for correctness.
     * @param ev Event object, which can be inspected for target, value, etc.
     */
    const handleOnChange = (ev) => {
        ev.preventDefault();
        const {name, value} = ev.target;
        setLoginForm({
            ...loginForm,
            [name] : value 
        })
        console.log(loginForm)
        

    }

    const handleOnSubmit = async (ev) => {
        ev.preventDefault()
        console.log(process.env.REACT_APP_FRONTEND_SERVER_URL)

        await axios
        .post(
            process.env.REACT_APP_FRONTEND_SERVER_URL + '/login',
            loginForm
        )
        .then((res) => {
            //all 2xx status codes end in here.
            console.log(res);
            if(res.status === 200) {
                alert('Login successful')
                localStorage.setItem('auth', JSON.stringify(res.headers.getAuthorization()))
            } 
        })
        .catch((err) => {
            //all 4xx and 5xx status codes end in here.
            console.log("error", err)
            if(err.response.data.statusCode === 400){
                let finalErrorMessage = err.response.data.message + "\n";
                err.response.data.errors.map((errorMsg) => {
                    finalErrorMessage += errorMsg;
                })
                alert(finalErrorMessage)
            } else {
                alert(err.response.data.message)
            }
        })
    }

    return(
        <>
            <Navbar />
            <div className="login-container">
                <h2 className = 'first-title'>Electronic LogBook</h2>
                <h2 className = 'second-title'>Login to 2school</h2>
                <form onSubmit = {handleOnSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input 
                            type = "email" 
                            id = "email" 
                            name = "email" 
                            value = {loginForm.email}
                            placeholder = 'Insert your email...' 
                            onChange = {handleOnChange}    
                            required 
                        />
                    </div>
                    <div className = "form-group">
                        <label htmlFor = "password">Password:</label>
                        <input 
                            type = "password" 
                            id = "password" 
                            name = "password" 
                            value = {loginForm.password}
                            placeholder = 'Insert your password...' 
                            onChange = {handleOnChange}    
                            required 
                        />
                    </div>
                    <div className = 'submit-button'>
                        <button 
                            type = "submit"
                        >
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default LoginForm;