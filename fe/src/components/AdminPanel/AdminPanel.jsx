/**
 * @fileoverview Main.jsx
 * This component renders the page containing all info of the logged user
 * in order to see and modify them.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/
import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { useNavigate } from 'react-router-dom';
import { Avatar, List, Skeleton } from 'antd';
import { Calendar, theme } from 'antd';
import { getAuthUserFromToken, executeNetworkOperation, buildAuthHeader } from '../../utils/utils';
import { INSTITUTE_NAME } from '../../utils/info';
import { Tooltip } from 'antd';
import Button from 'react-bootstrap/Button';

// const onPanelChange = (value, mode) => {
//   console.log(value.format('YYYY-MM-DD'), mode);
// };

/******** Component Definition  *************************************************/

/**
 * Main
 * This component renders the info received from db of the logged user
 * and shows them in order to modify some of them. 
 * @returns Instantiation of the elements that contain the user information.
 */
const AdminPanel = () => {

    const navigate = useNavigate();

    useEffect(() => {
    }, []);

    return (
        <div className='container-admin'>
           <button 
            type = 'button'
            onClick = {e => navigate("/signup")}
            > Create New User </button>
            <button 
                type = 'button'
                onClick = {e => navigate("/createSubject")}
            > Create New Subject </button>
            <button
                disabled
                style={{backgroundColor:'#3c3c3c'}}
                type = 'button'
                onClick = {e => navigate("/createClass")}
            > Create New Class </button>
            <button 
                disabled
                style={{backgroundColor:'#3c3c3c'}}
                type = 'button'
                onClick = {e => navigate("/addUserToClass")}
            > Add User to Class </button>
            <button 
                type = 'button'
                onClick = {e => navigate("/addSubjectToTeacher")}
            > Add Subject to Teacher </button>
            <button 
                disabled
                style={{backgroundColor:'#3c3c3c'}}
                type = 'button'
                onClick = {e => navigate("/modifyDeleteUser")}
            > Modify/Delete User </button>
        </div>
      );
}

export default AdminPanel;