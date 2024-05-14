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
import { Button } from 'antd';
import { InfoOutlined } from '@ant-design/icons';
import { getAuthUserFromToken, executeNetworkOperation, buildAuthHeader } from '../../utils/utils';
import { Tooltip } from 'antd';
import { Table } from 'antd';

/******** Component Definition  *************************************************/

/**
 * Main
 * This component renders the info received from db of the logged user
 * and shows them in order to modify some of them. 
 * @returns Instantiation of the elements that contain the user information.
 */
const ModifyDeleteUser = () => {

    const navigate = useNavigate();
    const [UserRowSelection, setUserRowSelection] = useState({});
    const [selectionType, setSelectionType] = useState('radio');
    const [UserTableData, setUserTableData] = useState([]);
    const [currentSelectedUserRow, setCurrentSelectedUserRow] = useState({});

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

    const UserTableProps = {
        UserRowSelection
      };
    const UserTableColumns = UserColumns.map((item) => (
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
        getUsers();
    }, []);


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

    const deleteSelectedUser = async () => {
        let { token, decodedUser } = getAuthUserFromToken();
        if(!token){
            alert("Cannot retrieve user information. Please login again.")
            navigate("/login");
          } else {
            let currentSelectedUserId = currentSelectedUserRow.id;
            if((currentSelectedUserId && currentSelectedUserId.length > 0))
            {
                let outputRes = await executeNetworkOperation ('delete', `/deleteUser/${currentSelectedUserId}`, "", buildAuthHeader(token))
                console.log(outputRes)                
                alert(outputRes.data.message);
                if(outputRes.data.tokenExpired){
                  navigate("/login");
                } else {
                    getUsers();
                }                
            } else {
                alert("Please select a valid association subject-teacher.");
            }           
            

          }
    }

    return (
        <>
        <Tooltip title="To delete an user from the system, select them in the respective tables, then click Delete.">
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
        <Button type = 'button' onClick={deleteSelectedUser}>
            Delete
        </Button>
        <Button type = 'button' disabled>
            Modify
        </Button>
        </>
      );
}

export default ModifyDeleteUser;