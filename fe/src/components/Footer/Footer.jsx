/**
 * @fileoverview Footer.jsx
 * This component renders the footer.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

import React, { useEffect, useState } from "react";
import './Footer.css';
import { CopyrightOutlined } from '@ant-design/icons';

/******** Component Definition  *************************************************/
/**
 * Footer
 * This component defines the layout of the footer.
 */

const Footer = () => {
    
    return (
        <div className = "footer">
            <p className = "copyright"><CopyrightOutlined /> All rights reserved.</p>
        </div> 
    ) 
}

export default Footer;