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
import './AddSubjectToTeacher.css';


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
const AddSubjectToTeacher = () => {

    const [initLoading, setInitLoading] = useState(true);
    const navigate = useNavigate();
    const [listOfSubjects, setListOfSubject] = useState([]);
    const [listOfTeachers, setListOfTeachers] = useState([]);
    const [SubjectRowSelection, setSubjectRowSelection] = useState({});
    const [TeacherRowSelection, setTeacherRowSelection] = useState({});
    const [selectionType, setSelectionType] = useState('radio');
    const [SubjectTableData, setSubjectTableData] = useState([]);
    const [TeacherTableData, setTeacherTableData] = useState([]);
    const [currentSelectedSubjectRow, setCurrentSelectedSubjectRow] = useState({});
    const [currentSelectedTeacherRow, setCurrentSelectedTeacherRow] = useState({});

    const SubjectColumns = [
        {
          title: 'Nr',
          dataIndex: 'nr',
          width: '2%'
        },
        {
          title: 'Subject',
          dataIndex: 'sub',
          width: '20%'
        }
      ];
      const TeacherColumns = [
        {
          title: 'Nr',
          dataIndex: 'nr',
          width: '2%'
        },
        {
          title: 'Teacher',
          dataIndex: 'teacherName',
          width: '20%'
        },
        {
            title: 'Subjects',
            dataIndex: 'subjects',
            width: '20%'
          }
      ];
    const SubjectTableProps = {
        SubjectRowSelection
      };
    const SubjectTableColumns = SubjectColumns.map((item) => (
    {
        ...item  
    }
    ));
    const TeacherTableProps = {
        TeacherRowSelection
      };
    const TeacherTableColumns = TeacherColumns.map((item) => (
    {
        ...item  
    }
    ));

    useEffect(() => {
        setSubjectRowSelection({
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`SUBJ selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
              setCurrentSelectedSubjectRow(selectedRows[0]);
            },
            getCheckboxProps: (record) => ({
              disabled: record.name === 'Disabled User',
              // Column configuration not to be checked
              name: record.name,
            }),
          });
          setTeacherRowSelection({
            onChange: (selectedRowKeys, selectedRows) => {
              console.log(`TEACH selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
              setCurrentSelectedTeacherRow(selectedRows[0]);
            },
            getCheckboxProps: (record) => ({
              disabled: record.name === 'Disabled User',
              // Column configuration not to be checked
              name: record.name,
            }),
          });
        getSubjects();
        getTeachers();
    }, []);

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
              let localSubjArr = [];
              outputRes.data.payload.map(sub => {
                localSubjArr.push({
                    key: outputRes.data.payload.indexOf(sub),
                    id: sub._id,
                    sub: sub.name,
                    nr: outputRes.data.payload.indexOf(sub)+1,
                })
              })
              setSubjectTableData(localSubjArr);
            } else {
              alert(outputRes.data.message);
              if(outputRes.data.tokenExpired){
                navigate("/login");
              }
            }
        }
  
      }

      const getTeachers = async () => {
        let { token, decodedUser } = getAuthUserFromToken();
  
        if(!token){
          alert("Cannot retrieve user information. Please login again.")
          navigate("/login");
        } else {
            let tokenUserId = decodedUser.userId;
            let outputRes = await executeNetworkOperation ('get', `/getAllUsers?category=345`, "", buildAuthHeader(token))
            console.log(outputRes)
            if(outputRes.data.statusCode === 200) {
              setInitLoading(false);
              let localTeachArr = [];
              outputRes.data.payload.map(t => {
                let localSubjArr = [];
                let TeacherSubjListString;
                if(t.subjectsId.length > 0){
                    t.subjectsId.map(tsub => {
                        localSubjArr.push(tsub.name);
                    })
                    TeacherSubjListString = localSubjArr.toString();
                }
                localTeachArr.push({
                    key: outputRes.data.payload.indexOf(t),
                    id: t._id,
                    teacherName: t.firstName + " " + t.lastName,
                    nr: outputRes.data.payload.indexOf(t)+1,
                    subjects: TeacherSubjListString
                })
              })
              setTeacherTableData(localTeachArr);
            } else {
              alert(outputRes.data.message);
              if(outputRes.data.tokenExpired){
                navigate("/login");
              }
            }
        }
  
      }

    const addSubjectToTeacher = async () => {
        let { token, decodedUser } = getAuthUserFromToken();
  
        if(!token){
          alert("Cannot retrieve user information. Please login again.")
          navigate("/login");
        } else {
            let currentSelectedSubjectId = currentSelectedSubjectRow.id;
            let currentSelectedTeacherId = currentSelectedTeacherRow.id;
            if((currentSelectedSubjectId && currentSelectedSubjectId.length > 0) &&
               (currentSelectedTeacherId && currentSelectedTeacherId.length > 0))
            {
                let outputRes = await executeNetworkOperation ('put', `/addSubjectToTeacher?subjectId=${currentSelectedSubjectId}&teacherId=${currentSelectedTeacherId}`, "", buildAuthHeader(token))
                console.log(outputRes)                
                alert(outputRes.data.message);
                if(outputRes.data.tokenExpired){
                  navigate("/login");
                } else {
                  getTeachers();
                }                
            } else {
                alert("Please select a valid association subject-teacher.");
            }
            
        }
    }

    return (
        <div className = 'add-sub-tot-teach-container'>
          <Tooltip title="To add a subject to a teacher, select them in the respective tables, then click Add.">
              <Button shape="circle" icon={<InfoOutlined />} className='info-disciplinary'/>
          </Tooltip>
          <div className='column-center-detailed'>
                <Table
                    {...SubjectTableProps}
                    columns={SubjectTableColumns}
                    dataSource={SubjectTableData}
                    pagination={false}
                    rowSelection={{
                      type: selectionType,
                      ...SubjectRowSelection,
                    }}                  
                />
          </div>
          <div className='column-center-detailed column-add-user-to-class'>
                <Table
                    {...SubjectTableProps}
                    columns={TeacherTableColumns}
                    dataSource={TeacherTableData}
                    className = 'add-user-to-class-table2'
                    pagination={false}
                    rowSelection={{
                      type: selectionType,
                      ...TeacherRowSelection,
                    }}                  
                />
            <Button type = 'primary' onClick={addSubjectToTeacher} className='button-add-user-to-class'>
                Add
            </Button>
          </div>
        </div>
      );
}

export default AddSubjectToTeacher;