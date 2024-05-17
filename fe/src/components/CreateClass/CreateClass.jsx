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
import { Avatar, List, Skeleton, Divider, Modal, Button } from 'antd';
import { ReadOutlined, InfoOutlined } from '@ant-design/icons';
import { Calendar, theme } from 'antd';
import { getAuthUserFromToken, executeNetworkOperation, buildAuthHeader } from '../../utils/utils';
import { INSTITUTE_NAME } from '../../utils/info';
import { Tooltip } from 'antd';
import { TEACHER_CATEGORY_ID, STUDENT_CATEGORY_ID } from '../../utils/info';
import './CreateClass.css';


// const onPanelChange = (value, mode) => {
//   console.log(value.format('YYYY-MM-DD'), mode);
// };
const TEACHER_STRING = "Teacher";
const STUDENT_STRING = "Student";
/******** Component Definition  *************************************************/

/**
 * Main
 * This component renders the info received from db of the logged user
 * and shows them in order to modify some of them. 
 * @returns Instantiation of the elements that contain the user information.
 */
const CreateClass = () => {

    const [initLoading, setInitLoading] = useState(true);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [list, setList] = useState([]);
    const navigate = useNavigate();
    const [classForm, setClassForm] = useState( 
        {   
            grade: '',
            section: ''
        }
    );

    useEffect(() => {
        getClasses();
    }, []);

    const handleCreateNewClass = (ev) => {
        ev.preventDefault();
        setIsClassModalOpen(!isClassModalOpen);
    }

    const clearForm = () => {
        setClassForm({   
            grade: '',
            section: ''
        });
        let select = document.getElementById("select-grade");
        if(select){
            select.value = "default";
        }
    }

    const handleOkClassModal = async (ev) => {
        ev.preventDefault();
        let { token, decodedUser } = getAuthUserFromToken();
    
        let localErrorArray = checkInput()
        if(localErrorArray.length > 0) {
            let finalErrorMessage = "";
            localErrorArray.map((errorsMessage) => {
                finalErrorMessage += (errorsMessage + "\n")
            });
            alert(finalErrorMessage);
            localErrorArray  = [];
        } else{
            if(!token){
                alert("Cannot retrieve user information. Please login again.")
                navigate("/login");
                } else {
                    let outputRes = await executeNetworkOperation(
                        'post',
                        '/createClass',
                        classForm,
                        buildAuthHeader(token)
                    );
            
                    console.log(outputRes);
                    alert(outputRes.data.message)
                    if(outputRes.data.tokenExpired){
                        navigate("/login");
                    }
                    clearForm();
                    getClasses();
            } 
        }
        setIsClassModalOpen(!isClassModalOpen);
    }

    const handleCancelClassModal = (ev) => {
        ev.preventDefault();
        setIsClassModalOpen(!isClassModalOpen);
    }

    const checkInput = () => {
        let errorMsg = "";
        let localErrorArray = [];
    
        if(parseInt(classForm.grade, 10) < 0 || parseInt(classForm.grade, 10) > 5){
            errorMsg = "Grade can only go from 1 to 5.";
            localErrorArray.push(errorMsg);
        }
    
        //password and passwordConf must match
        if(classForm.section.length > 1 || classForm.section.match(/\d+/g)) {
            errorMsg = "Section must be a single letter.";
            localErrorArray.push(errorMsg);
        }       
    
        return localErrorArray;
    }

    /**
     * handleOnChange
     * This function collects all the input parameters and fills the signupForm
     * accordingly.
     * @param ev Event object, which can be inspected for target, value, etc.
     */    
    const handleOnChange = (ev) => {
        ev.preventDefault();    
        const {name, value} = ev.target;

        if(ev.target.options){
            let selectGradeText = ev.target.options[ev.target.selectedIndex].text;
            setClassForm({
                ...classForm,
                grade : selectGradeText 
            })
        } else {
            setClassForm({
                ...classForm,
                [name] : value
            })
        }
    }

    const getClasses = async () => {
        let { token, decodedUser } = getAuthUserFromToken();
        if(!token){
          alert("Cannot retrieve user information. Please login again.")
          navigate("/login");
        } else {
            let tokenUserId = decodedUser.userId;  
            let outputRes = await executeNetworkOperation ('get', `/getClasses/${tokenUserId}`, "", buildAuthHeader(token))
            console.log(outputRes)
            if(outputRes.data.statusCode === 200) {
              setInitLoading(false);
              setList(outputRes.data.payload);
              console.log("Loading finished")
            } else {
              alert(outputRes.data.message);
            }
        }
      }

    return (
        <div className = 'create-class-container'>
            <div className='column-center-main'>
                <Tooltip title="To create a new classroom, click the button and insert the needed information.">
                    <Button shape="circle" icon={<InfoOutlined />} className='info-disciplinary'/>
                </Tooltip>
                  <Divider orientation="left">All Classrooms</Divider>
                    <List
                        loading={initLoading}
                        itemLayout="horizontal"
                        dataSource={list}
                        renderItem={(item) => (
                      
                            <List.Item
                            key={item._id}
                            
                            >
                            <Skeleton avatar title={false} loading={item.loading} active>
                                <List.Item.Meta
                                avatar={<Avatar src={item.logo} />}
                                title={item.gradeOfClass + item.section}
                                description={INSTITUTE_NAME}
                                />
                                {/* <div>content</div> */}
                            </Skeleton>
                            </List.Item>
                    )}
                    />
                </div>
                <div className='try'>
                    <Button 
                        type = 'primary'
                        onClick = {handleCreateNewClass}
                        className = 'button-create-class'
                    > 
                        Create New Class 
                    </Button>
                </div>
                <Modal 
                    title="Create Class" 
                    open={isClassModalOpen} 
                    onOk={handleOkClassModal} 
                    onCancel={handleCancelClassModal}
                >
                <form className = 'entire-form'>
                    <div className="form-group first-form-group">
                        <select id="select-grade" name="grade" onChange={handleOnChange} required>
                             <option value="1">1</option>
                             <option value="2">2</option>
                             <option value="3">3</option>
                             <option value="4">4</option>
                             <option value="5">5</option>
                             <option value="default" disabled selected>Select Grade</option>
                        </select>  
                        <input 
                            maxLength="1"
                            pattern='[A-Za-z]'
                            type="string" 
                            name="section" 
                            placeholder="Section Letter (A-Z)" 
                            value = {classForm.section}
                            onChange = {handleOnChange}    
                            required 
                        />
                    </div>
                    </form>                    
                </Modal>


        </div>
      );
}

export default CreateClass;