/**
 * @fileoverview ClassDetails.jsx
 * This component renders the page in which the
 * details of the specified class are shown.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

import React, { useEffect, useState } from 'react';
import './ClassDetails.css';
import { getAuthUserFromToken, executeNetworkOperation, buildAuthHeader } from '../../utils/utils';
import { INSTITUTE_NAME } from '../../utils/info';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Card, List, Tooltip, Modal, Dropdown, Typography } from 'antd';
import { Checkbox } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, InfoOutlined, CheckOutlined } from '@ant-design/icons';
import { FileOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { TEACHER_CATEGORY_ID, STUDENT_CATEGORY_ID } from '../../utils/info';

/******** Component Definition  *************************************************/

/**
 * ClassDetails
 * This component renders the layout of the page built to show
 * the details of the specified blogpost object.
 * @returns Instantiation of the elements that contain the class information.
 */
const ClassDetails = () => {

    const [initLoading, setInitLoading] = useState(true);
    const [size, setSize] = useState('large');
    const [isClickedHmwk, setIsClickedHmwk] = useState(false);
    const [listOfSubjects, setListOfSubjects] = useState([]);
    const [isClickedDisciplinary, setIsClickedDisciplinary] = useState(false);
    const [isModalHomeworkOpen, setIsModalHomeworkOpen] = useState(false);
    const [isModalHomeworkModifyOpen, setIsModalHomeworkModifyOpen] = useState(false);
    const [isModalDisciplinaryFileOpen, setIsModalDisciplinaryFileOpen] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null)
    const navigate = useNavigate();
    const [selectionType, setSelectionType] = useState('radio');
    const [isEditing, setIsEditing] = useState(false);
    const [currentUploadedFile, setCurrentUploadedFile] = useState({});
    const [currentSelectedSubject, setCurrentSelectedSubject] = useState({label: '', value: ''});
    const [currentHomeworkText, setCurrentHomeworkText] = useState();
    const [currentHomeworkItemId, setCurrentHomeworkItemId] = useState("");
    const [tableData, setTableData] = useState([]);
    const [homeworkData, setHomeworkData] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [currentClassReports, setCurrentClassReports] = useState([]);
    const [currentSelectedRow, setCurrentSelectedRow] = useState({});
    const [disciplinaryReportList, setDisciplinaryReportList] = useState([]);
    const [disciplinaryReportId, setDisciplinaryReportId] = useState();
    const [currentUserCategory, setCurrentUserCategory] = useState();
    const [isStudent, setIsStudent] = useState(false);
    const [isTeacher, setIsTeacher] = useState(false);
    const [newHomework, setNewHomework] = useState(
      {
        subject: '',
        content: ''
      }
    ); 
    const [newDisciplinaryReport, setNewDisciplinaryReport] = useState(
      {
        id: '',
        content: '',
        studentId : '',
        teacherId : ''
      }
    ); 
    const columns = [
      {
        title: 'Nr',
        dataIndex: 'nr',
        width: '2%'
      },
      {
        title: 'Name',
        dataIndex: 'name',
        width: '20%'
      },
      {
        title: 'Missing',
        dataIndex: 'missing',
        width: '5%'
      },
    ];

    /** id of the selected class, passed through url Params */
    let { id } = useParams();

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
            let localListOfSubjects = [];
            outputRes.data.payload.map(s => {
              localListOfSubjects.push({
                label: s.name,
                value: s._id,
              })
            setListOfSubjects(localListOfSubjects);
            })
          } else {
            alert(outputRes.data.message);
          }
      }
    }

    const getClassDetails = async () => {
        let { token, decodedUser } = getAuthUserFromToken();
        console.log("decoded", decodedUser)
        if(!token){
          alert("Cannot retrieve classroom information. Please login again.")
          navigate("/login");
        } else {
            let outputRes = await executeNetworkOperation ('get', `/getClass/${id}`, "", buildAuthHeader(token))

            if(outputRes.data.statusCode === 200) {
              setInitLoading(false);
              let localData = [];
              let localHomeworkData = [];
              //data = outputRes.data.payload.studentsId;
              outputRes.data.payload.studentsId.map(student => {
                localData.push({
                  key: outputRes.data.payload.studentsId.indexOf(student),
                  id: student._id,
                  name: student.lastName + " " + student.firstName,
                  nr: outputRes.data.payload.studentsId.indexOf(student) + 1,
                  missing: <Checkbox onChange={onChange}></Checkbox> 
                });    
              })
              setTableData(localData);              
            } else {
              alert(outputRes.data.message + "\n Please, try again.");
            }
        }
      }
    
    const tableProps = {
      rowSelection
    };
  
    const tableColumns = columns.map((item) => (
      {
          ...item  
      }
    ));

    const onChange = (e) => {
      e.preventDefault()
      console.log(`checked = ${e.target.checked}`);
    };

    const handleHomework = () => {
      setIsClickedHmwk(!isClickedHmwk)
    }
    
    const showModalHomework = () => {
      setIsModalHomeworkOpen(true);     
    };

    const showModalModifyHomework = () => {
      setIsModalHomeworkModifyOpen(true);     
    };

    const handleCancelModifyHomework = () => {
      setIsModalHomeworkModifyOpen(false);
      setCurrentHomeworkText("");
      setCurrentSelectedSubject({label: '', value: ''})
      setCurrentUploadedFile({});
      if(document.getElementById('attachment-mod')){
        document.getElementById('attachment-mod').value= null;
      }
    };

    const handleOkHomework = async () => {

      if(currentSelectedSubject.label.length === 0){
        alert("Select a subject before uploading new homework.")
      } else {
        
        let headers = {};
        let reqBody = {};
        let { token, decodedUser } = getAuthUserFromToken();
        
        reqBody["subjectId"] = currentSelectedSubject.value;
        reqBody["teacherId"] = decodedUser.userId;

        if(currentUploadedFile.name){
          console.log("MULTIPART")
          headers["Content-Type"] = "multipart/form-data";
          reqBody["attachment"] = currentUploadedFile;
        } else {
          console.log("JSON")
          headers["Content-Type"] = "application/json";
        }

        if(currentHomeworkText.length > 0){
          reqBody["content"] = currentHomeworkText;
        }

        if(!reqBody["content"] && !reqBody["attachment"]){
          alert("Please provide data to add a new homework.");
        } else {
          
          let mergedHeaders = {...headers, ...buildAuthHeader(token)};
          let targetURL;
          let targetMethod;
          if(currentHomeworkItemId){
            targetMethod = 'patch'
            targetURL = `/modifyItem?classId=${id}&itemId=${currentHomeworkItemId}&itemType=homework`;
          } else {
            targetMethod = 'post'
            targetURL = `/addHomeworkToClass?classId=${id}`;
          }
          let outputRes = await executeNetworkOperation (
            targetMethod, 
            targetURL,
            reqBody, 
            mergedHeaders
          );
          alert(outputRes.data.message);
          getHomeworks();
          setCurrentHomeworkText("");
          setCurrentSelectedSubject({label: '', value: ''})
          setCurrentUploadedFile({});
          setCurrentHomeworkItemId("");
          if(document.getElementById('attachment-mod')){
            document.getElementById('attachment-mod').value= null;
          }
        }
      }      
      setIsModalHomeworkOpen(false);
      setIsModalHomeworkModifyOpen(false);
    }

    const handleCancelHomework = () => {
      setIsModalHomeworkOpen(false);
      setCurrentHomeworkText("");
      setCurrentSelectedSubject({label: '', value: ''})
      setCurrentUploadedFile({});
      setCurrentHomeworkItemId("");
      if(document.getElementById('attachment-mod')){
        document.getElementById('attachment-mod').value= null;
      }
      if(document.getElementById('attachment')){
        document.getElementById('attachment').value= null;
      }
    };

    const handleOnChangeHmwk = (ev) => {
      ev.preventDefault();
      setCurrentHomeworkText(ev.target.value);
    }

    const addNewHomework = async () => {
      let { token, decodedUser } = getAuthUserFromToken();
      
    }


    const handleDisciplinary = () => {
      setIsClickedDisciplinary(!isClickedDisciplinary)
    }


    const showModalDisciplinaryFile = () => {
      setIsModalDisciplinaryFileOpen(true);
    };

    const handleOnChangeDisciplinaryReport = (ev) => {
      ev.preventDefault();
        const {name, value} = ev.target;
        setNewDisciplinaryReport({
            ...newDisciplinaryReport,
            [name] : value 
        })
    }

    const handleIsEditingReport = async (item) => {
      let index = disciplinaryReportList.indexOf(item);
      let tempArray = Array.from(disciplinaryReportList);
      let isItemEditing = tempArray[index].isEditing;
      let { token } = getAuthUserFromToken();

      if(isItemEditing){
        let outputRes = await executeNetworkOperation (
          'patch', 
          `/modifyItem?itemId=${item.id}&classId=${id}&itemType=disciplinaryFile`, 
          {content: item.content}, 
          buildAuthHeader(token)
        )
        alert(outputRes.data.message)
        getReports()
      } else {
        tempArray[index].isEditing = !isItemEditing;
        setDisciplinaryReportList(tempArray);  
      }
   }

    const handleModificationReport = async (newContent, item) => {
      let index = disciplinaryReportList.indexOf(item);
      let tempArray = Array.from(disciplinaryReportList);
      tempArray[index].content = newContent;
      setDisciplinaryReportList(tempArray);
    }

    const handleDeleteReport = async (item) => {
      let { token } = getAuthUserFromToken();


        let outputRes = await executeNetworkOperation (
          'delete', 
          `/deleteItem?itemId=${item.id}&classId=${id}&itemType=disciplinaryFile`, 
          "", 
          buildAuthHeader(token)
        )
        alert(outputRes.data.message)
        getReports()
      
    }


    const getReports = async () => {
      let { token, decodedUser } = getAuthUserFromToken();
        console.log("decoded", decodedUser)
        if(!token){
          alert("Cannot retrieve reports information. Please login again.")
          navigate("/login");
        } else {
            let outputRes = await executeNetworkOperation ('get', `/getReports/${id}`, "", buildAuthHeader(token))

            if(outputRes.data.statusCode === 200) {
              let disciplinaryReportArrayFromBe = outputRes.data.payload;
              let disciplinaryReportArrayToShow = [];
              console.log(disciplinaryReportArrayFromBe);
              disciplinaryReportArrayFromBe.map(df => {
                let studentId = df.studentId;
                let studentName;
                if(studentId){
                  studentName = df.studentId.lastName + " " +  df.studentId.firstName
                } else {
                  studentName = "All students"
                }
                disciplinaryReportArrayToShow.push(
                  {
                    id: df._id,
                    studentName: studentName,
                    teacherName: df.teacherId.lastName + " " +  df.teacherId.firstName,
                    content: df.content,
                    isEditing : false
                  }
                )
              });
              console.log(disciplinaryReportArrayToShow)
              setDisciplinaryReportList(disciplinaryReportArrayToShow);
            } else {
              alert(outputRes.data.message + "\n Please, try again.");
            }
        }
    }

    const getHomeworks = async () => {
      let { token, decodedUser } = getAuthUserFromToken();
        if(!token){
          alert("Cannot retrieve reports information. Please login again.")
          navigate("/login");
        } else {
            let outputRes = await executeNetworkOperation ('get', `/getHomeworks/${id}`, "", buildAuthHeader(token))

            if(outputRes.data.statusCode === 200) {
              let localHomeworkData = [];
              outputRes.data.payload.map(hw => {
                localHomeworkData.push({
                  id: hw._id,
                  title: hw.subjectId.name,
                  subjectId: hw.subjectId._id,
                  content: hw.content,
                  teacher: hw.teacherId.firstName + " " + hw.teacherId.lastName,
                  attachment: hw.attachment || "",
                  isEditing : false
                });                
              })
              setHomeworkData(localHomeworkData);
              console.log(localHomeworkData);
            } else {
              alert(outputRes.data.message + "\n Please, try again.");
            }
        }
    }

    const handleDeleteHmwk = async (item) => {
      let { token } = getAuthUserFromToken();


      let outputRes = await executeNetworkOperation (
        'delete', 
        `/deleteItem?itemId=${item.id}&classId=${id}&itemType=homework`, 
        "", 
        buildAuthHeader(token)
      )
      alert(outputRes.data.message)
      getHomeworks();
    }

    const handleIsEditingHmwk = async (item) => {
        showModalModifyHomework(true);
        setCurrentHomeworkItemId(item.id);
        setCurrentSelectedSubject({label: item.title, value: item.subjectId});
        setCurrentHomeworkText(item.content);
        if(item.attachment.length > 0){
          setCurrentUploadedFile(item.attachment);
        } else {
          setCurrentUploadedFile("");
        }
        let index = homeworkData.indexOf(item);
        let tempArray = Array.from(homeworkData);
        tempArray[index].isEditing = !tempArray[index].isEditing;
        setHomeworkData(tempArray);
        
    }

    const addNewDisciplinaryReport = async () => {
      let { token, decodedUser } = getAuthUserFromToken();
      let tokenUserId = decodedUser.userId;
      let disciplinaryFile;
      if(currentSelectedRow.id){
        disciplinaryFile = {
          teacherId : tokenUserId,
          studentId : currentSelectedRow.id,
          content   : newDisciplinaryReport.content
        };
      } else {
        disciplinaryFile = {
          teacherId : tokenUserId,
          content   : newDisciplinaryReport.content
        };
      }

      setNewDisciplinaryReport(disciplinaryFile);
      console.log(disciplinaryFile);  

      let outputRes = await executeNetworkOperation ('post', `/addReport/${id}`, disciplinaryFile, buildAuthHeader(token));
      console.log(outputRes);
      if(outputRes.data.statusCode === 200) {
        alert("Report added successfully.");
        getReports();
      } else {
        alert(outputRes.data.message + "\n Please, try again.");
      }
    };
    

    const handleOkDisciplinaryFile = async () => {
      await addNewDisciplinaryReport();
      setIsModalDisciplinaryFileOpen(false);
      setNewDisciplinaryReport({content: ''});
    }

    const handleCancelDisciplinaryFile = () => {
      setIsModalDisciplinaryFileOpen(false);
      setNewDisciplinaryReport({content: ''});
    };

    const handleHomeworkSelect = (value, option) => {
      setCurrentSelectedSubject(option);
    }

    const handleUploadedHomeworkFile = (ev) => {
      console.log(ev.target.files[0]);
      setCurrentUploadedFile(ev.target.files[0]);
    }

    useEffect(() => {
      setRowSelection({
        onChange: (selectedRowKeys, selectedRows) => {
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
          setCurrentSelectedRow(selectedRows[0]);
        },
        getCheckboxProps: (record) => ({
          disabled: record.name === 'Disabled User',
          // Column configuration not to be checked
          name: record.name,
        }),
      });
      let { token, decodedUser } = getAuthUserFromToken();
      setCurrentUserCategory(decodedUser.userCategory);
      getClassDetails();
      getReports();
      if(decodedUser.userCategory === TEACHER_CATEGORY_ID){
        getSubjects();
        setIsTeacher(true)
      } else {
        // get Teachers
        setIsStudent(true)
      }      
      getHomeworks();
    }, []);   

       return(
        <>
          <div className='container-class-details'>
            <div className='column-center-detailed'>
              <Table
                  {...tableProps}
                  columns={tableColumns}
                  dataSource={tableData}
                  pagination={false}
                  rowSelection={{
                    type: selectionType,
                    ...rowSelection,
                  }}                  
              />
            </div>
            <div className = 'column-right-detailed'>
              <div className = 'homework-section-detailed'>
                <Button 
                  size={size} 
                  className='homework-button'
                  onClick={handleHomework}
                >
                  <p>📓	Homework</p>
                </Button>
                {
                  isClickedHmwk ?  
                                <div>
                                  {
                                    isTeacher ? <div className='add-section'>
                                                  <Tooltip title="Add">
                                                    <Button shape="circle" icon={<PlusOutlined />} onClick={showModalHomework} />
                                                  </Tooltip>
                                                  <Modal title="Add new homework" open={isModalHomeworkOpen} onOk={handleOkHomework} onCancel={handleCancelHomework}>
                                                  <Select
                                                    onChange={handleHomeworkSelect}
                                                    defaultValue="Select.."
                                                    style={{
                                                      width: 120,
                                                    }}
                                                    options={listOfSubjects}
                                                    value={currentSelectedSubject.label}
                                                  />
                                                    <textarea 
                                                      type="text"
                                                      name = 'content'
                                                      value={currentHomeworkText} 
                                                      placeholder='Write here your homework...'
                                                      onChange={handleOnChangeHmwk}
                                                    />
                                                    <input 
                                                      type="file" 
                                                      id="attachment"
                                                      name="attachment"
                                                      accept="*"
                                                      onChange={handleUploadedHomeworkFile}
                                                    />
                                                  </Modal>
                                                </div> : ""
                                  }                        
                                  <List
                                    grid={{
                                      gutter: 16,
                                      column: 3,
                                    }}
                                    className = 'homework-list'
                                    dataSource={homeworkData}
                                    renderItem={(item) => (
                                      <List.Item>
                                        <Card title={item.title}>
                                          <p>Author: {item.teacher}</p>                                         
                                          <p>{item.content}</p>
                                          {
                                            item.attachment.length > 0 ? <p>📎 <a href={item.attachment} target="_blank">See attachment</a></p> : ""
                                          }
                                          {
                                            isTeacher ? <div className = 'homework-btn-section'>
                                                          <Button 
                                                            shape="circle" 
                                                            icon= {<EditOutlined />}

                                                            className='dis-icon-buttons' 
                                                            onClick={e => handleIsEditingHmwk(item)}
                                                          />
                                                          <Modal title="Modify Homework" open={isModalHomeworkModifyOpen} onOk={handleOkHomework} onCancel={handleCancelModifyHomework}>
                                                            <Select
                                                              onChange={handleHomeworkSelect}
                                                              defaultValue="Select.."
                                                              style={{
                                                                width: 120,
                                                              }}
                                                              options={listOfSubjects}
                                                              value={currentSelectedSubject}
                                                            />
                                                              <textarea 
                                                                type="text"
                                                                name = 'content'
                                                                value={currentHomeworkText} 
                                                                placeholder='Write here your homework...'
                                                                onChange={handleOnChangeHmwk}
                                                              />
                                                              <input 
                                                                type="file" 
                                                                id="attachment-mod"
                                                                name="attachment"
                                                                accept="*"
                                                                onChange={handleUploadedHomeworkFile}
                                                              />
                                                              {
                                                                currentUploadedFile.length > 0 ? <p><a href={item.attachment} target="_blank"><FileOutlined />Attachment</a> is present</p>: <p>Attachment not present</p>
                                                              }
                                                          </Modal>
                                                          <Button 
                                                            shape="circle" 
                                                            icon={<DeleteOutlined />} 
                                                            onClick={e => handleDeleteHmwk(item)}
                                                            className='dis-icon-buttons' 
                                                          />
                                                        </div> : ""
                                          }
                                          
                                          </Card>
                                      </List.Item>
                                    )}
                                  /> 
                                </div> : ""
                }
              </div>
              <div className='disciplinary-section-detailed'>
                <div className='disciplinary-section'>                
                  <Button 
                    size={size} 
                    className='disciplinary-button'
                    onClick={handleDisciplinary}
                  >
                    ⚠️ Disciplinary Report
                  </Button>
                  {
                    isTeacher ? <>
                                  <Tooltip title="To add a report to a student, you need to select them first. Otherwise, it will be added to the entire class.">
                                    <Button shape="circle" icon={<InfoOutlined />} className='info-disciplinary'/>
                                  </Tooltip>
                                </> : ""
                  }
                  </div>
                {
                  isClickedDisciplinary ? 
                                        <div> 
                                          {
                                            isTeacher ? <div className='add-section'>
                                                          <Tooltip title="Add">
                                                            <Button shape="circle" icon={<PlusOutlined />} onClick={showModalDisciplinaryFile} />
                                                          </Tooltip>
                                                          <Modal 
                                                            title="Add new report" 
                                                            open={isModalDisciplinaryFileOpen} 
                                                            onOk={handleOkDisciplinaryFile} 
                                                            onCancel={handleCancelDisciplinaryFile}
                                                          >
                                                            <textarea 
                                                              type="text"
                                                              name = 'content'
                                                              value={newDisciplinaryReport.content} 
                                                              placeholder='Write here your report...'
                                                              onChange={handleOnChangeDisciplinaryReport}
                                                            />
                                                            
                                                          </Modal>
                                                        </div> : ""
                                          }
                                            
                                            <List
                                              className='list-disciplinary'
                                              header={<div>Today's report(s)</div>}
                                              bordered
                                              dataSource={disciplinaryReportList}
                                              renderItem={(item) => (
                                                <List.Item id={item._id}>
                                                  From: {item.teacherName} 
                                                    <Typography.Text mark>{item.studentName.toUpperCase()}</Typography.Text> 
                                                    {
                                                      isTeacher && item.isEditing ?                                     
                                                        <div className="ms-2 me-auto">
                                                            <textarea
                                                              type="text"
                                                              name = "content"
                                                              value={item.content}
                                                              onChange={(e) => handleModificationReport(e.target.value, item)}
                                                            /> 
                                                        </div> 
                                                      : " " + item.content
                                                    }
                                                    {
                                                      isTeacher ? <div className = 'btn-disciplinary-section'>
                                                                    <Button 
                                                                      shape="circle" 
                                                                      icon=
                                                                      {
                                                                        item.isEditing ? <CheckOutlined /> : <EditOutlined />
                                                                      }
                                                                      className='dis-icon-buttons' 
                                                                      onClick={e => handleIsEditingReport(item)}
                                                                    />
                                                                    <Button 
                                                                      shape="circle" 
                                                                      icon={<DeleteOutlined />} 
                                                                      className='dis-icon-buttons' 
                                                                      onClick={e => handleDeleteReport(item)}
                                                                    />
                                                                  </div> : ""
                                                    }

                                                </List.Item>
                                              )}
                                            />
                                        </div> : ""
                }
              </div>
            </div>
          </div>
        </>
       )      
}

export default ClassDetails;
