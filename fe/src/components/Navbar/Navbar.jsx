/**
 * @fileoverview Navbar.jsx
 * This component renders the navigation bar.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

import React, { useEffect, useState } from "react";
import './Navbar.css'
import { getAuthUserFromToken, saveAuthToken, resetAuthToken } from '../../utils/utils';
import { useNavigate } from 'react-router-dom';

/******** Component Definition  *************************************************/
/**
 * Navbar
 * This component defines the layout of the navigation bar and allows 
 * the user to log out.
 */
const Navbar = () => {

    const { token, decodedUser } = getAuthUserFromToken();
    const [currentUserFullName, setCurrentUserFullName] = useState('');
    const [loggedIn, setLoggedIn] = useState(false);
    const navigate = useNavigate();

    /**
     * This function decodes the author name from the jwt token generated with all authors infos.
     * @returns the author name if any token is found in local storage.
     */
    const getUserFullName = () => {
        let name;
        
        if(token){
            const firstName = decodedUser.firstName;
            const lastName = decodedUser.lastName;
            name = firstName + ' ' + lastName;
        } else {
            name = ''
        }

        return name
    }

    /**
     * This functions is triggered anytime a user presses the Log out button and removes
     * the authorization token while redirecting to the login page.
     */
    const handleLogout = () => {
        resetAuthToken();
        alert('Logout successful.');
        navigate('/login');
    }

    /** When token key is detected, the function to get the author name is triggered 
     * in order to show it in the navbar section and the loggedIn state is updated. 
     * If no token is found, the user is logged out.
     */

    useEffect( () => {
        if(token){
            setLoggedIn(true)
            const userFullName = getUserFullName();
            if(userFullName.length > 0) {
                setCurrentUserFullName(userFullName)
            } else {
                setCurrentUserFullName('unknown')
            }
        } else {
            setLoggedIn(false)
        }
    }, [token])


    return(
        <nav className = "myNav">
            <span className = "logo-img"><img src = {require('./assets/logo-zoomed.png')} alt="logo" /></span>
            {
              loggedIn ? <div>  Hi, {`${currentUserFullName}`}  <button type = "button" onClick = {handleLogout}>Log out</button></div> : ''
            }
        </nav>
    )
}

export default Navbar;