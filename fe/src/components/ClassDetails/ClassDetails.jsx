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
import { PlusOutlined, DownOutlined } from '@ant-design/icons';



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
    const [isClickedDisciplinary, setIsClickedDisciplinary] = useState(false);
    const [isModalHomeworkOpen, setIsModalHomeworkOpen] = useState(false);
    const [isModalDisciplinaryFileOpen, setIsModalDisciplinaryFileOpen] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null)
    const navigate = useNavigate();
    const [selectionType, setSelectionType] = useState('radio');
    const [tableData, setTableData] = useState([]);
    const [homeworkData, setHomeworkData] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [currentClassReports, setCurrentClassReports] = useState([]);
    const [currentSelectedRow, setCurrentSelectedRow] = useState({});
    const [newHomework, setNewHomework] = useState(
      {
        subject: '',
        content: ''
      }
    ); 
    const [newDisciplinaryReport, setNewDisciplinaryReport] = useState(
      {
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
              console.log(tableData)
              //setHomeworkData(outputRes.data.payload.homeworkId);
              outputRes.data.payload.homeworkId.map(hw => {
                localHomeworkData.push({
                  title: hw.subjectId.name,
                  content: hw.content
                });                
              })
              setHomeworkData(localHomeworkData);
              //console.log(data.studentsId[0].firstName)
              
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

    const handleOnChangeHmwk = (ev) => {
      ev.preventDefault();
        const {name, value} = ev.target;
        setNewHomework({
            ...newHomework,
            [name] : value 
        })
        console.log(newHomework)
    }
    const addNewHomework = async () => {
      let { token, decodedUser } = getAuthUserFromToken();
      
    }

    const handleHomework = () => {
      setIsClickedHmwk(!isClickedHmwk)
    }

    const handleDisciplinary = () => {
      setIsClickedDisciplinary(!isClickedDisciplinary)
    }

    const showModalHomework = () => {
      setIsModalHomeworkOpen(true);     
    };

    const showModalDisciplinaryFile = () => {
      if(currentSelectedRow.id){
        setIsModalDisciplinaryFileOpen(true);
      } else {
        alert("Select a student first.");
      }
    };

    const handleOnChangeDisciplinaryReport = (ev) => {
      ev.preventDefault();
        const {name, value} = ev.target;
        setNewDisciplinaryReport({
            ...newDisciplinaryReport,
            [name] : value 
        })
    }
    const addNewDisciplinaryReport = async () => {
      let { token, decodedUser } = getAuthUserFromToken();
      let tokenUserId = decodedUser.userId;

      if(currentSelectedRow.id){
        let disciplinaryFile = {
          teacherId : tokenUserId,
          studentId : currentSelectedRow.id,
          content   : newDisciplinaryReport.content
        };
        setNewDisciplinaryReport(disciplinaryFile);
        console.log(disciplinaryFile);  

        let outputRes = await executeNetworkOperation ('post', `/addReport/${id}`, disciplinaryFile, buildAuthHeader(token));
        if(outputRes.data.statusCode === 200) {
          console.log("DR:", outputRes)
        } else {
          console.log(outputRes);
        }

      } else {
        // do nothing, im future: add note to the class
      }

      // newDisciplinaryReport['teacherId'] = tokenUserId;
      // newDisciplinaryReport['studentId'] = studentId;

      // console.log(newDisciplinaryReport)


      /* let outputRes = await executeNetworkOperation ('post', `/addReport/${id}`, "", buildAuthHeader(token))
      if(outputRes.data.statusCode === 200) {

      } else {

      }

      setIsModalOpen(false); */
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

    const handleOkHomework = async () => {
      setIsModalHomeworkOpen(false);
    }

    const handleCancelHomework = () => {
      setIsModalHomeworkOpen(false);
    };

    useEffect(() => {
      setRowSelection({
        onChange: (selectedRowKeys, selectedRows) => {
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
          setCurrentSelectedRow(selectedRows[selectedRowKeys]);
        },
        getCheckboxProps: (record) => ({
          disabled: record.name === 'Disabled User',
          // Column configuration not to be checked
          name: record.name,
        }),
      });
      getClassDetails()
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
              <div>
                <Button 
                  size={size} 
                  className='homework-button'
                  onClick={handleHomework}
                >
                  Homework
                </Button>
                {
                  isClickedHmwk ?  
                                <div> 
                                  <Tooltip title="Add">
                                    <Button shape="circle" icon={<PlusOutlined />} onClick={showModalHomework} />
                                  </Tooltip>
                                  <Modal title="Add new homework" open={isModalHomeworkOpen} onOk={handleOkHomework} onCancel={handleCancelHomework}>
                                    <select name="subject" id="select-sub">
                                      <option value={newHomework.subject} selected>1</option>
                                      <option value={newHomework.subject}>2</option>
                                    </select>
                                    <textarea 
                                      type="text"
                                      name = 'content'
                                      value={newHomework.content} 
                                      placeholder='Write here your homework...'
                                      onChange={handleOnChangeHmwk}
                                    />
                                  </Modal>
                                  <List
                                    grid={{
                                      gutter: 16,
                                      column: 3,
                                    }}
                                    className = 'homework-list'
                                    dataSource={homeworkData}
                                    renderItem={(item) => (
                                      <List.Item>
                                        <Card title={item.title}>{item.content}</Card>
                                      </List.Item>
                                    )}
                                  /> 
                                </div> : ""
                }
              </div>
              <div>
                <Button 
                  size={size} 
                  className='disciplinary-button'
                  onClick={handleDisciplinary}
                >
                  Disciplinary report
                </Button>
                {
                  isClickedDisciplinary ? <div> 
                                            <Tooltip title="Add">
                                              <Button shape="circle" icon={<PlusOutlined />} onClick={showModalDisciplinaryFile} />
                                            </Tooltip>
                                            <Modal title="Add new report" open={isModalDisciplinaryFileOpen} onOk={handleOkDisciplinaryFile} onCancel={handleCancelDisciplinaryFile}>
                                              <textarea 
                                                type="text"
                                                name = 'content'
                                                value={newDisciplinaryReport.content} 
                                                placeholder='Write here your report...'
                                                onChange={handleOnChangeDisciplinaryReport}
                                              />
                                            </Modal>
                                            <List
                                              header={<div>Today's report(s)</div>}
                                              bordered
                                              dataSource={currentClassReports}
                                              renderItem={(item) => (
                                                <List.Item>
                                                  <Typography.Text mark>[ITEM]</Typography.Text> {item}
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
       /*  <div className = 'container-class-details'>
          <div
            style={{
              marginBottom: 16,
            }}
          >
            <span
              style={{
                marginLeft: 8,
              }}
            >
              {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
            </span>
          </div>
        </div> */
      
}

export default ClassDetails;
