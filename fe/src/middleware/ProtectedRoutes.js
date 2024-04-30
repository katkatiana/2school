/**
 * @fileoverview ProtectedRoutes.js
 * This component protects the Homepage and SelectedBlogPost pages in order to check 
 * if the user is authorized by token key to access these routes.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

import { Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Unauthorized from "../pages/Unauthorized";
/**
 * This function check if any token is stored in the local storage.
 * @returns bool
 */
const checkAuth = (roles) => {

    let token = localStorage.getItem('auth');
    if(!token) {
        return false;
    } else {
        let decodedUser = jwtDecode(token);
        let decodedUserRole = decodedUser.userRole;
        if(roles.includes(decodedUserRole)){
            return true;
        } else {
            return false;
        }
    }
}

/**
 * This function check the eventual authorization to navigate the Homepage. 
 * If not so, the user will be redirected to LoginPage.
 */
const ProtectedRoutes = ({ allowedRoles = [] }) => {

    const authValid = checkAuth(allowedRoles);    
    
    return authValid ? <Outlet /> : <Unauthorized />;  
}

export default ProtectedRoutes;