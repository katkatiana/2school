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
import { Table } from 'antd';


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
const AddUserToClass = () => {

    const [initLoading, setInitLoading] = useState(true);
    const navigate = useNavigate();
    const [listOfUsers, setListOfUsers] = useState([]);
    const [listOfClass, setListOfClass] = useState([]);
    const [UserRowSelection, setUserRowSelection] = useState({});
    const [ClassRowSelection, setClassRowSelection] = useState({});
    const [selectionType, setSelectionType] = useState('radio');
    const [UserTableData, setUserTableData] = useState([]);
    const [ClassTableData, setClassTableData] = useState([]);
    const [currentSelectedUserRow, setCurrentSelectedUserRow] = useState({});
    const [currentSelectedClassRow, setCurrentSelectedClassRow] = useState({});

    const UserColumns = [
        {
          title: 'Nr',
          dataIndex: 'nr',
          width: '2%'
        },
        {
          title: 'User',
          dataIndex: 'userName',
          width: '50%'
        },
        {
            title: 'Category',
            dataIndex: 'usercategory',
            width: '30%'
          }
      ];

      const ClassColumns = [
        {
          title: 'Nr',
          dataIndex: 'nr',
          width: '2%'
        },
        {
          title: 'Class',
          dataIndex: 'className',
          width: '2%'
        },
        {
            title: 'Students',
            dataIndex: 'studentsList',
            width: '50%'
        },
        {
            title: 'Teachers',
            dataIndex: 'teachersList',
            width: '50%'
        }
      ];
    const UserTableProps = {
        UserRowSelection
      };
    const UserTableColumns = UserColumns.map((item) => (
    {
        ...item  
    }
    ));
    const ClassTableProps = {
        ClassRowSelection
      };
    const ClassTableColumns = ClassColumns.map((item) => (
    {
        ...item  
    }
    ));

    useEffect(() => {
        setUserRowSelection({
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`User selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
              setCurrentSelectedUserRow(selectedRows[0]);
            },
            getCheckboxProps: (record) => ({
              disabled: record.name === 'Disabled User',
              // Column configuration not to be checked
              name: record.name,
            }),
          });
          setClassRowSelection({
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`Class selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
              setCurrentSelectedClassRow(selectedRows[0]);
            },
            getCheckboxProps: (record) => ({
              disabled: record.name === 'Disabled User',
              // Column configuration not to be checked
              name: record.name,
            }),
          });
        getUsers();
        getClasses();
    }, []);

      const getClasses = async () => {
        let { token, decodedUser } = getAuthUserFromToken();
        if(!token){
          alert("Cannot retrieve user information. Please login again.")
          navigate("/login");
        } else {
            let tokenUserId = decodedUser.userId;  
            let outputRes = await executeNetworkOperation ('get', `/getClasses/${tokenUserId}`, "", buildAuthHeader(token))
            console.log("CLASSES", outputRes)
            if(outputRes.data.statusCode === 200) {
                setInitLoading(false);
                let localClassesArr = [];
                let localTeachersOfClass = [];
                let localStudentsOfClass = [];

                outputRes.data.payload.map(cl => {

                    let localTeachersOfClass = cl.teachers; 
                    let localTeachersString = ""
                    let localStudentsOfClass = cl.students;
                    let localStudentsString = ""
                    
                    if(localTeachersOfClass){
                        console.log(localTeachersOfClass)
                        localTeachersOfClass.map(t => {
                            localTeachersString += t.firstName+" "+t.lastName+" "
                        })
                    }

                    if(localStudentsOfClass){
                        console.log(localStudentsOfClass)
                        localStudentsOfClass.map(s => {
                            localStudentsString += s.firstName+" "+s.lastName+" "
                        })
                    }

                    localClassesArr.push({
                      key: outputRes.data.payload.indexOf(cl),
                      id: cl._id,
                      className: cl.gradeOfClass + " " + cl.section,
                      nr: outputRes.data.payload.indexOf(cl) + 1,
                      teachersList: localTeachersString,
                      studentsList: localStudentsString
                  })
                })
                setClassTableData(localClassesArr);
            } else {
              alert(outputRes.data.message);
              if(outputRes.data.tokenExpired){
                navigate("/login");
              }
            }
        }
      }

      const getUsers = async () => {
        let { token, decodedUser } = getAuthUserFromToken();
  
        if(!token){
          alert("Cannot retrieve user information. Please login again.")
          navigate("/login");
        } else {
            let tokenUserId = decodedUser.userId;
            let outputRes = await executeNetworkOperation ('get', `/getAllUsers?category=all`, "", buildAuthHeader(token))
            console.log(outputRes)
            if(outputRes.data.statusCode === 200) {
              setInitLoading(false);
              let localUserArr = [];
              outputRes.data.payload.map(t => {
                
                localUserArr.push({
                    key: outputRes.data.payload.indexOf(t),
                    id: t._id,
                    userName: t.firstName + " " + t.lastName,
                    nr: outputRes.data.payload.indexOf(t) + 1,
                    usercategory: t.subjectsId ? "Teacher" : "Student"
                })
              })
              setUserTableData(localUserArr);
            } else {
              alert(outputRes.data.message);
              if(outputRes.data.tokenExpired){
                navigate("/login");
              }
            }
        }
  
      }

    const addUserToClass = async () => {
        let { token, decodedUser } = getAuthUserFromToken();
  
        if(!token){
          alert("Cannot retrieve user information. Please login again.")
          navigate("/login");
        } else {
            let currentSelectedUserId = currentSelectedUserRow.id;
            let currentSelectedClassId = currentSelectedClassRow.id;
            if((currentSelectedUserId && currentSelectedUserId.length > 0) &&
               (currentSelectedClassId && currentSelectedClassId.length > 0))
            {
                let outputRes = await executeNetworkOperation ('put', `/addUserToClass?classId=${currentSelectedClassId}&userId=${currentSelectedUserId}`, "", buildAuthHeader(token))
                console.log(outputRes)                
                alert(outputRes.data.message);
                if(outputRes.data.tokenExpired){
                  navigate("/login");
                } else {
                    getClasses();
                }                
            } else {
                alert("Please select a valid association subject-teacher.");
            }
            
        }
    }

    return (
        <>
        <Tooltip title="To add an user to a class, select them in the respective tables, then click Add.">
            <Button shape="circle" icon={<InfoOutlined />} className='info-disciplinary'/>
        </Tooltip>
        <div className='column-center-detailed'>
              <Table
                  {...UserTableProps}
                  columns={UserTableColumns}
                  dataSource={UserTableData}
                  pagination={false}
                  rowSelection={{
                    type: selectionType,
                    ...UserRowSelection,
                  }}                  
              />
        </div>
        <div className='column-center-detailed'>
              <Table
                  {...ClassTableProps}
                  columns={ClassTableColumns}
                  dataSource={ClassTableData}
                  pagination={false}
                  rowSelection={{
                    type: selectionType,
                    ...ClassRowSelection,
                  }}                  
              />
        </div>
        <Button type = 'button' onClick={addUserToClass}>
            Add
        </Button>
        </>
      );
}

export default AddUserToClass;