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


/******** Component Definition  *************************************************/

/**
 * ClassDetails
 * This component renders the layout of the page built to show
 * the details of the specified blogpost object.
 * @returns Instantiation of the elements that contain the class information.
 */
const ClassDetails = () => {


    const [initLoading, setInitLoading] = useState(true);
    const [list, setList] = useState([]);
    const navigate = useNavigate();


    /** id of the selected class, passed through url Params */
    let { id } = useParams();
    const session = JSON.parse(localStorage.getItem('auth'));

    const getClassDetails = async () => {
        let { token, decodedUser } = getAuthUserFromToken();
        if(!token){
          alert("Cannot retrieve classroom information. Please login again.")
          navigate("/login");
        } else {
            let tokenUserId = decodedUser.userId;
  
            let outputRes = await executeNetworkOperation ('get', `/getClass/${id}`, "", buildAuthHeader(token))
            console.log(outputRes)
            if(outputRes.data.statusCode === 200) {
              setInitLoading(false);
              setList(outputRes.data.payload);
            } else {
              alert(outputRes.data.message + "\n Please, try again.");
            }
        }
      }
      
      useEffect(() => {
        getClassDetails()
      }, []);
  

}

export default ClassDetails;
