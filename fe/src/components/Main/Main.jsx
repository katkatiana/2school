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
import { Calendar, theme, Divider } from 'antd';
import { ReadOutlined } from '@ant-design/icons';
import { getAuthUserFromToken, executeNetworkOperation, buildAuthHeader } from '../../utils/utils';
import { INSTITUTE_NAME } from '../../utils/info';
import { TEACHER_CATEGORY_ID, STUDENT_CATEGORY_ID } from '../../utils/info';
import { Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';


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
    const [currentUserCategory, setCurrentUserCategory] = useState();
    const [list, setList] = useState([]);
    const [listOfSubjects, setListOfSubject] = useState([]);
    const [listOfTeachers, setListOfTeachers] = useState([]);
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
          if(outputRes.data.statusCode === 200) {
            setInitLoading(false);
            setList(outputRes.data.payload);
            if(decodedUser.userCategory === STUDENT_CATEGORY_ID){
              let localTeachersArray = [];
              let localSubjectsArray = [];
              let classArray = outputRes.data.payload; 
              if(classArray.length > 0){
                classArray[0].teachers.map(t => {
                  let teacherSubjectArray = t.subjectsId;
                  let teacherLocalSubjectArray = [];
                  teacherSubjectArray.map(s => {
                    teacherLocalSubjectArray.push(s.name)
                  })
                  let subjString = teacherLocalSubjectArray.toString();
                  subjString = subjString.replace(",", "\n")
                  localTeachersArray.push({
                    teacherName : t.firstName + " " + t.lastName,
                    subjectString : teacherLocalSubjectArray
                  })
                });
                setListOfTeachers(localTeachersArray);
              }
            }
          } else {
            alert(outputRes.data.message);
            if(outputRes.data.tokenExpired){
              navigate("/login");
            }
          }
      }
    }

    const getSubjects = async () => {
      let { token, decodedUser } = getAuthUserFromToken();

      if(!token){
        alert("Cannot retrieve user information. Please login again.")
        navigate("/login");
      } else {
          let tokenUserId = decodedUser.userId;
          let outputRes = await executeNetworkOperation ('get', `/getSubjects/${tokenUserId}`, "", buildAuthHeader(token))
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
    
    useEffect(() => {
      let { token, decodedUser } = getAuthUserFromToken();
      setCurrentUserCategory(decodedUser.userCategory);
      getClasses();
      if(decodedUser.userCategory === TEACHER_CATEGORY_ID){
        getSubjects();
      } 
    }, []);

    return (
        <>
            <div className = 'container-main'>
                { currentUserCategory === TEACHER_CATEGORY_ID ?
                  <div className='column-left-main'>
                    <Divider orientation="left" className='column-left-main-title'>📖 Your Subjects</Divider>
                    <List
                      size="small"
                      className = 'sub-list'
                      bordered
                      dataSource={listOfSubjects}
                      renderItem={(item) => <List.Item>{item.name}</List.Item>}
                    />
                    </div>
                    : 
                    <div className='column-left-main'>
                    <Divider orientation="left" className='column-left-main-title'>🧑🏻‍🏫 Your Teachers</Divider>
                    <List
                      size="small"
                      bordered
                      dataSource={listOfTeachers}
                      renderItem={(item) => 
                        <List.Item>
                          <UserOutlined className='sub-icon' />
                          <p>{item.teacherName}</p>
                          <p>{item.subjectString}</p>
                        </List.Item>
                      }
                    />
                  </div>
                }
                <div className='column-center-main'>
                  <Divider orientation="left">📚 Your Classrooms</Divider>
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
                          <a href={"/classDetails/" + item._id} key="list-loadmore-edit">🔎Details</a>
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
                <div style={wrapperStyle} className = 'column-right-main'>
                    <Calendar fullscreen={false} /*onPanelChange={onPanelChange}*/ />
                </div>
            </div>
      </>
      );
}

export default Main;