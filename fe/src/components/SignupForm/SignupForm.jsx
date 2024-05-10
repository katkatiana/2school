/**
 * @fileoverview SignupForm.jsx
 * This component renders the page in which it is 
 * possible to sign up after compiling sign up form.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

import React, { useState } from 'react';
import { getAuthUserFromToken, executeNetworkOperation, buildAuthHeader } from '../../utils/utils';
import './SignupForm.css';
import Navbar from '../Navbar/Navbar'
import { TEACHER_CATEGORY_ID, STUDENT_CATEGORY_ID } from '../../utils/info';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
/******** Component Definition  *************************************************/

const TEACHER_STRING = "Teacher";
const STUDENT_STRING = "Student";

/**
 * SignupForm
 * This component renders the text areas that can be used to input
 * a new signup with already existing users. 
 * @returns Instantiation of the elements that contain the sign up form.
 */
const SignupForm = () => {

    const navigate = useNavigate();
    const [signupForm, setSignupForm] = useState( 
        {   
            firstName: '',
            lastName: '',
            email: '', 
            password: '',
            passwordConf: '',
            userCategory: 0
        }
    );

/**
 * handleOnChange
 * This function collects all the input parameters and fills the signupForm
 * accordingly.
 * @param ev Event object, which can be inspected for target, value, etc.
 */    
const handleOnChange = (ev) => {
    ev.preventDefault();    
    const {name, value} = ev.target;

    if(ev.target.options){
        let selectedUserCategory;
        let selectText = ev.target.options[ev.target.selectedIndex].text;
        if(selectText.toString() === TEACHER_STRING){
            selectedUserCategory = TEACHER_CATEGORY_ID;
        } else {
            selectedUserCategory = STUDENT_CATEGORY_ID;
        }
        setSignupForm({
            ...signupForm,
            userCategory : selectedUserCategory 
        })
    } else {
        setSignupForm({
            ...signupForm,
            [name] : value 
        })
    }
}

/**
 * This function checks if the password has been correctly written in both text area
 * in order to let the user know if the password was not typed properly.
 * It also checks the length of the password that has to be longer than 8 characters
 * and that the email is in the correct format.
 */
const checkInput = () => {
    let errorMsg = "";
    let localErrorArray = [];

    //password must contain at least 8 characters
    if(signupForm.password.length < 8){
        errorMsg = "Passwords must contain at least 8 characters.";
        localErrorArray.push(errorMsg);
    }

    //password and passwordConf must match
    if(signupForm.password !== signupForm.passwordConf) {
        errorMsg = "Passwords do not match.";
        localErrorArray.push(errorMsg);
    } 

    //email must be in a correct format
    if(!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/).test(signupForm.email)) {
        errorMsg ='Email is not in a correct format.';
        localErrorArray.push(errorMsg);
    }

    if(signupForm.userCategory.length === 0) {
        errorMsg = "You must specify a user category.";
        localErrorArray.push(errorMsg);
    } else {

    }

    return localErrorArray;
}

const clearForm = () => {
    setSignupForm(        {   
        firstName: '',
        lastName: '',
        email: '', 
        password: '',
        passwordConf: '',
        userCategory: 0
    });
    let select = document.getElementById("select-user-cat");
    if(select){
        select.value = "default";
    }
}

/**
 * handleOnSubmit
 * Method: POST
 * This function performs a fetch operation against
 * the configured API to register the user after checking its data.
 * The function gets the inputs from the signupForm state.
 * On a successful fetch, data get collected in db
 * and the user is redirected to the login page.
 * If any kind of error occurs during the Fetch operation, 
 * the Error is signalled through the error internal state.
 * @param ev 
 */
 const handleOnSubmit = async (ev) => {
    ev.preventDefault()
    let { token, decodedUser } = getAuthUserFromToken();

    let localErrorArray = checkInput()
    if(localErrorArray.length > 0) {
        let finalErrorMessage = "";
        localErrorArray.map((errorsMessage) => {
            finalErrorMessage += (errorsMessage + "\n")
        });
        alert(finalErrorMessage);
        localErrorArray  = [];
    } else{
        if(!token){
            alert("Cannot retrieve user information. Please login again.")
            navigate("/login");
            } else {
                let outputRes = await executeNetworkOperation(
                    'post',
                    '/signup',
                    signupForm,
                    buildAuthHeader(token)
                );
        
                console.log(outputRes);
                if(outputRes.status === 400) {
                    let finalErrorMessage = outputRes.data.message + "\n";
                            outputRes.data.errors.map((errorMsg) => {
                            finalErrorMessage += errorMsg;
                        });
                    alert(finalErrorMessage)
                } else {
                    alert(outputRes.data.message)
                    if(outputRes.data.tokenExpired){
                        navigate("/login");
                    }
                }
                clearForm();
        } 
    }       
} 

    return(
        <>
            <Navbar />
            <div className="signup-form">
                <h2>User Sign Up</h2>
                <form onSubmit = {handleOnSubmit} className = 'entire-form'>
                    <div className="form-group first-form-group">
                        <input 
                            type = "string" 
                            name = "firstName" 
                            placeholder = "First Name" 
                            value = {signupForm.firstName}
                            onChange = {handleOnChange}    
                            required 
                        />
                        <input 
                            type="string" 
                            name="lastName" 
                            placeholder="Last Name" 
                            value = {signupForm.lastName}
                            onChange = {handleOnChange}    
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Email" 
                            value = {signupForm.email}
                            onChange = {handleOnChange}    
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Password"
                            value = {signupForm.password}
                            onChange = {handleOnChange}     
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            type="password" 
                            name="passwordConf" 
                            placeholder="Password confirmation"
                            value = {signupForm.passwordConf}
                            onChange = {handleOnChange}     
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <select id="select-user-cat" name="usercategory" onChange={handleOnChange}>
                             <option value="teacher">{TEACHER_STRING}</option>
                             <option value="student">{STUDENT_STRING}</option>
                             <option value="default" disabled selected>Select user category</option>
                        </select>                        
                    </div>
                    <div className = 'form-button'>
                        <Button type="submit">Sign Up</Button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default SignupForm; 