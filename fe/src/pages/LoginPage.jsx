/**
 * @fileoverview LoginPage.jsx
 * This component renders the login page of the application.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

import React from 'react';
import LoginForm from '../components/LoginForm/LoginForm';
import { useEffect } from 'react';
import { resetAuthToken } from '../utils/utils';

/******** Component Definition  *************************************************/

/**
 * LoginPage
 * This component renders the login page of the application.
 * @returns the instantiation of the LoginForm component.
 */
const LoginPage = () => {

    
    /**
     * At the opening of the page, if any token key is detected it is instantly removed
     * from local storage.
     */
    useEffect( () => {
        resetAuthToken();        
    }, [])

    return (
        <LoginForm />
    )
}


export default LoginPage;
