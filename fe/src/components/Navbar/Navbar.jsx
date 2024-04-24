import React, { useEffect, useState } from "react";
import './Navbar.css'

const Navbar = () => {
    return(
        <nav className = "myNav">
            <span className = "logo-img"><img src = {require('./assets/logo-zoomed.png')} alt="logo" /></span>
        </nav>
    )
}

export default Navbar;