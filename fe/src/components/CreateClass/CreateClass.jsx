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
import { Avatar, List, Skeleton, Divider } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
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
const CreateClass = () => {

    const [initLoading, setInitLoading] = useState(true);
    const [list, setList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getClasses();
    }, []);

    const handleOnChange = (ev) => {
        ev.preventDefault();
        

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
            } else {
              alert(outputRes.data.message);
            }
        }
      }

    return (
        <>
        <div className='column-center-main'>
        <Divider orientation="left">Your classrooms</Divider>
        <List
        className="demo-loadmore-list"
        loading={initLoading}
        itemLayout="horizontal"
        dataSource={list}
        renderItem={(item) => (
            
            <List.Item
                key={item._id}
            >
                <Skeleton avatar title={false} active>
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

        </>
      );
}

export default CreateClass;