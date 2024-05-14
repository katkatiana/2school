/**
 * @fileoverview AdminPanel.jsx
 * This component renders the page containing all the features available to the admin user.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/
import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { useNavigate } from 'react-router-dom';
import { Tag, Button, Tooltip } from 'antd';
import { executeNetworkOperation } from '../../utils/utils';
import { CONTACT_EMAIL } from '../../utils/info';

/******** Component Definition  *************************************************/

/**
 * Main
 * This component renders the info received from db of the logged user
 * and shows them in order to modify some of them. 
 * @returns Instantiation of the elements that contain the user information.
 */
const AdminPanel = () => {

    const navigate = useNavigate();
    const [backendIsUp, setBackendIsUp] = useState(false);

    useEffect(() => {
    const updateBackendStatus = async () => {
        let outputRes = await executeNetworkOperation('get', "");
        console.log(outputRes)
        if(outputRes){
            if(outputRes.data.statusCode && outputRes.data.statusCode === 200){
                setBackendIsUp(true);
            } else {
                setBackendIsUp(false);
            }
        } else {
            setBackendIsUp(false);
        }
    }
    updateBackendStatus();
    }, []);

    return (        
        
        <div className='container-admin'>
            
            {
                backendIsUp ? <p align="center">Great! All systems are  <Tag color="#87d068">up</Tag>and running.</p> : <p align="center">Something is wrong and the server connection is <Tag color="#f50">down</Tag><br/>Please reach out to <a href={"mailto:"+CONTACT_EMAIL}>{CONTACT_EMAIL}.</a></p>
            }

           <Tooltip title="Create a new user, either a teacher or a student.">
            <Button 
                    type = 'button'
                    onClick = {e => navigate("/signup")}
                    > Create New User 
                </Button>
            </Tooltip>
            <Tooltip title="Modify or delete an existing user.">
                <Button 
                    type = 'button'
                    onClick = {e => navigate("/modifyDeleteUser")}
                > Modify/Delete User </Button>
            </Tooltip>
            <Tooltip title="Create a new subject.">
                <Button 
                    type = 'button'
                    onClick = {e => navigate("/createSubject")}
                > Create New Subject </Button>
            </Tooltip>
            <Tooltip title="Assign an existing subject to a given teacher.">
                <Button 
                    type = 'button'
                    onClick = {e => navigate("/addSubjectToTeacher")}
                > Add Subject to Teacher </Button>
            </Tooltip>
            <Tooltip title="Create a new classroom.">
                <Button
                    type = 'button'
                    onClick = {e => navigate("/createClass")}
                > Create New Class </Button>
            </Tooltip>
            <Tooltip title="Add an existing teacher or student to a given class.">
                <Button 
                    type = 'button'
                    onClick = {e => navigate("/addUserToClass")}
                > Add User to Class </Button>
            </Tooltip>
        </div>


      );
}

export default AdminPanel;