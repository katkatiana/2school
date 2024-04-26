/**
 * @fileoverview Navbar.jsx
 * This component renders the navigation bar.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

import React, { useEffect, useState } from "react";
import './Navbar.css'

/******** Component Definition  *************************************************/
/**
 * Navbar
 * This component defines the layout of the navigation bar and allows 
 * the user to log out.
 */
const Navbar = () => {
    return(
        <nav className = "myNav">
            <span className = "logo-img"><img src = {require('./assets/logo-zoomed.png')} alt="logo" /></span>
        </nav>
    )
}

export default Navbar;