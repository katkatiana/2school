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
import { Avatar, List, Skeleton, Divider, Button } from 'antd';
import { ReadOutlined, InfoOutlined } from '@ant-design/icons';
import { Calendar, theme } from 'antd';
import { getAuthUserFromToken, executeNetworkOperation, buildAuthHeader } from '../../utils/utils';
import { INSTITUTE_NAME } from '../../utils/info';
import { Tooltip } from 'antd';
import './CreateSubject.css';

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

    const [initLoading, setInitLoading] = useState(true);
    const [subjectName, setSubjectName] = useState({name: ''});
    const navigate = useNavigate();
    const [listOfSubjects, setListOfSubject] = useState([]);

    useEffect(() => {
        getSubjects();
    }, []);

    const handleOnChange = (ev) => {
        ev.preventDefault();
        
        const {name, value} = ev.target;
        setSubjectName({
            ...subjectName,
            [name] : value 
        })
    }

    const getSubjects = async () => {
        let { token, decodedUser } = getAuthUserFromToken();
  
        if(!token){
          alert("Cannot retrieve user information. Please login again.")
          navigate("/login");
        } else {
            let tokenUserId = decodedUser.userId;
            let outputRes = await executeNetworkOperation ('get', `/getSubjects/${tokenUserId}`, "", buildAuthHeader(token))
            console.log(outputRes)
            if(outputRes.data.statusCode === 200) {
              setInitLoading(false);
              setListOfSubject(outputRes.data.payload);
            } else {
              alert(outputRes.data.message);
              if(outputRes.data.tokenExpired){
                navigate("/login");
            }
            }
        }
  
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
                let outputRes = await executeNetworkOperation ('post', `/createSubject?subjectName=${subjectName.name}`, "", buildAuthHeader(token))
                console.log(outputRes)
                alert(outputRes.data.message);
                if(outputRes.data.tokenExpired){
                    navigate("/login");
                }
                getSubjects();
                setSubjectName("")
            }      
        }
    }

    return (
        <div className = 'entire-create-subject-page'>
            <div className = 'subjects-table'>
                <Tooltip title="To create a new subject, insert the subject name and then click Add.">
                        <Button shape="circle" icon={<InfoOutlined />} className='info-disciplinary'/>
                </Tooltip>
                <Divider orientation="left">All Subjects</Divider>
                <List
                className="demo-loadmore-list"
                loading={initLoading}
                itemLayout="horizontal"
                dataSource={listOfSubjects}
                renderItem={(item) => <List.Item>{item.name}</List.Item>}
                />
            </div>
            <div className = "add-subject-section">
                            <input 
                                type = "string" 
                                name = "name" 
                                placeholder = "Insert Subject Name here" 
                                value = {subjectName.name}
                                onChange = {handleOnChange}    
                                required 
                            />
                <Button 
                    type = 'primary'
                    onClick = {handleSubjectAdd}
                > Add </Button>
            </div>
        </div>
      );
}

export default CreateSubject;