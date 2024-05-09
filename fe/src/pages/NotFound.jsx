/**
 * @fileoverview NotFound.jsx
 * This component renders any page which does not exist as route
 * of the application.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';

/******** Component Definition  *************************************************/
/**
 * Maximum waiting time before redirection.
 */
const MAX_WAITING_S = 5
/**
 * NotFound
 * This component renders a message of not found along with a Spinner.
 * @returns the message mentioned above.
 */
const NotFound = () => {
    const navigate = useNavigate();
    const [seconds, setSeconds] = useState(MAX_WAITING_S);
  
    useEffect(() => {
      if (seconds > 0) {
        setTimeout(() => setSeconds(seconds - 1), 1000);
      } else {
        setSeconds(0);
        navigate("/login")
      }
    }, [seconds])  
  
    return (
      <div style={{textAlign : 'center', marginTop : 30}}>
        <Spin size="large" tip="Loading.."/>
        <p>Sorry, this page does not exist!</p>
        <p>You will be redirected in {seconds} seconds..</p>
      </div>
    )
}

export default NotFound;