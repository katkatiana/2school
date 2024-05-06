/**
 * @fileoverview UserPage.jsx
 * This component renders the user info.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer'
import UserInfo from '../components/UserInfo/UserInfo';


/******** Component Definition  *************************************************/

/**
 * Homepage
 * This component renders the home page of the application.
 * @returns the instantiation of the Main component.
 */
const UserPage = () => {

    return (
        <>
            <Navbar />
            <UserInfo />
            <Footer />
        </>
    )
}


export default UserPage;