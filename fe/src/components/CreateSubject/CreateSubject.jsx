/**
 * @fileoverview Main.jsx
 * This component renders the page containing all info of the logged user
 * in order to see and modify them.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/
import React, { useState, useEffect } from 'react';
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
const CreateSubject = () => {

    const [subjectName, setSubjectName] = useState({name: ''});
    const navigate = useNavigate();

    useEffect(() => {
    }, []);

    const handleOnChange = (ev) => {
        ev.preventDefault();
        
        const {name, value} = ev.target;
        setSubjectName({
            ...subjectName,
            [name] : value 
        })
    }

    const handleSubjectAdd = async (ev) => {
        ev.preventDefault();
        
        if(subjectName.length === 0){
            alert("You must specify a valid subject name.");
        } else {
            let { token, decodedUser } = getAuthUserFromToken();
            if(!token){
              alert("Cannot retrieve user information. Please login again.")
              navigate("/login");
            } else {
                let tokenUserId = decodedUser.userId;
      
                let outputRes = await executeNetworkOperation ('post', `/createSubject?subjectName=${subjectName}`, "", buildAuthHeader(token))
                console.log(outputRes)
                alert(outputRes.data.message);
            }      
        }
    }

    return (
        <>
           <div className="">
                        <input 
                            type = "string" 
                            name = "name" 
                            placeholder = "Insert Subject Name here" 
                            value = {subjectName}
                            onChange = {handleOnChange}    
                            required 
                        />
              <button 
                type = 'button'
                onClick = {handleSubjectAdd}
            > Add </button>
            </div>
        </>
      );
}

export default CreateSubject;