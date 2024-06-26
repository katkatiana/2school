/**
 * @fileoverview LoginSuccess.jsx
 * This component renders the message of correct login and 
 * redirection to the homepage.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { getAuthUserFromToken } from '../utils/utils';
import { TEACHER_CATEGORY_ID, STUDENT_CATEGORY_ID, ADMIN_CATEGORY_ID } from '../utils/info';
/******** Constants Section  *******************************************************/

/**
 * Maximum waiting time before redirection.
 */
const MAX_WAITING_S = 3

/******** Component Definition  *************************************************/

/**
 * LoginSuccess
 * This component implements a waiting mechanisms before redirecting to homepage.
 * @returns a div with the above mentioned message.
 */
const LoginSuccess = () => {

  /******** Internal Variables  ***************************************************/

  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(MAX_WAITING_S);
  const {token, decodedUser} = getAuthUserFromToken();

  useEffect(() => {
    if (seconds > 0) {
      setTimeout(() => setSeconds(seconds - 1), 1000);
    } else {
      setSeconds(0);
      let userCat = decodedUser.userCategory;
      if(userCat){
        if(userCat === TEACHER_CATEGORY_ID || userCat === STUDENT_CATEGORY_ID){
          navigate("/homepage");
        } else {
          navigate("/adminPage");
        }      
      } else {
        alert("Unrecognized user.");
        navigate("/login");
      }
      
    }
  }, [seconds])  

  return (
    <div style={{textAlign : 'center', marginTop : 30}}>
      <Spin size="large" tip="Loading.."/>
      <p>You will be redirected in {seconds} seconds..</p>
    </div>
  )
}

export default LoginSuccess;