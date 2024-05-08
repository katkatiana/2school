/**
 * @fileoverview Homepage.jsx
 * This component renders the home page of the application.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import AdminPanel from '../components/AdminPanel/AdminPanel';
import Footer from '../components/Footer/Footer'


/******** Component Definition  *************************************************/

/**
 * Homepage
 * This component renders the home page of the application.
 * @returns the instantiation of the Main component.
 */
const AdminPage = () => {

    return (
        <>
            <Navbar />
            <AdminPanel />
            <Footer />
        </>
    )
}


export default AdminPage;