/**
 * @fileoverview SelectedClass.jsx

 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer'
import ClassDetails from '../components/ClassDetails/ClassDetails';

/******** Component Definition  *************************************************/

/**
 * Homepage
 * This component renders the page of the selected class.
 * @returns the instantiation of the ClassDetails component.
 */
const SelectedClass = () => {

    return (
        <>
            <Navbar />
            <ClassDetails />
            <Footer />
        </>
    )
}


export default SelectedClass;