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

/******** Constants Section  *******************************************************/

/**
 * Maximum waiting time before redirection.
 */
const MAX_WAITING_S = 5;

/******** Component Definition  *************************************************/

/**
 * Unauthorized
 * This component renders a message of not found along with a Spinner.
 * @returns the message mentioned above.
 */
const Unauthorized = () => {

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

    return(
        <>
        <div>You are not authorized to see this page.</div>
        <div>You will be redirected to Login page in {seconds} seconds.</div>
        </>
    )
}

export default Unauthorized;