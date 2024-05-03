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
import './Main.css';
import { Avatar, List, Skeleton } from 'antd';
import { Calendar, theme } from 'antd';
import { getAuthUserFromToken, executeNetworkOperation, buildAuthHeader } from '../../utils/utils';
import { INSTITUTE_NAME } from '../../utils/info';
import { Tooltip } from 'antd';

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
const Main = () => {

    const [initLoading, setInitLoading] = useState(true);
    const [list, setList] = useState([]);
    const { token } = theme.useToken();
    const wrapperStyle = {
      border: `1px solid ${token.colorBorderSecondary}`,
      borderRadius: token.borderRadiusLG,
    };
    const navigate = useNavigate();

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
    
    useEffect(() => {
      getClasses()
    }, []);

    return (
        <>
            <div className = 'container'>
                <div className='column-left'>
                    <p>blablalblalblalblallbla</p>
                </div>
                <div className='column-center'>
                    <List
                    className="demo-loadmore-list"
                    loading={initLoading}
                    itemLayout="horizontal"
                    dataSource={list}
                    renderItem={(item) => (
                      
                        <List.Item
                          key={item._id}
                          actions={[
                          <Tooltip title="Go to classroom details">
                          <a href={"/classDetails/" + item._id} key="list-loadmore-edit">Details</a>
                          </Tooltip>
                        ]}
                        >
                          <Skeleton avatar title={false} loading={item.loading} active>
                              <List.Item.Meta
                              avatar={<Avatar src={item.logo} />}
                              title={<a href={"/classDetails/"+item._id}>{item.gradeOfClass + item.section}</a>}
                              description={INSTITUTE_NAME}
                              />
                              {/* <div>content</div> */}
                          </Skeleton>
                        </List.Item>
                    )}
                    />
                </div>
                <div style={wrapperStyle} className = 'column-right'>
                    <Calendar fullscreen={false} /*onPanelChange={onPanelChange}*/ />
                </div>
            </div>
      </>
      );
}

export default Main;