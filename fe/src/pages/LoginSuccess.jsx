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

  useEffect(() => {
    if (seconds > 0) {
      setTimeout(() => setSeconds(seconds - 1), 1000);
    } else {
      setSeconds(0);
      navigate("/homepage")
    }
  }, [seconds])  

  return (
    <div>You will be redirected in {seconds} seconds..</div>
  )
}

export default LoginSuccess;