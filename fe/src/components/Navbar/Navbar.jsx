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
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';


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
    const [size, setSize] = useState('small');
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
            <span className = "logo-img"><a href = {"http://localhost:3000/login"}><img src = {require('./assets/logo-zoomed.png')} alt="logo" /></a></span>
            {
              loggedIn ? <div className = "logged-nav"> <span className="welcome-msg"> Hi, {`${currentUserFullName}`}</span>
                            <Tooltip title="Account Info">
                                <Button type="primary" shape="round" icon={<UserOutlined />} size={size} onClick={(e) => navigate("/userDetail")} className = "nav-buttons" />
                            </Tooltip>
                            <Tooltip title="Logout">
                                <Button type="primary" shape="round" icon={<LogoutOutlined />} size={size}  onClick = {handleLogout} className = "nav-buttons" /> 
                            </Tooltip>
                        </div> : ''
            }
        </nav>
    )
}

export default Navbar;