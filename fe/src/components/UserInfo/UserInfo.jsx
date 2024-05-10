/**
 * @fileoverview UserInfo.jsx
 * This component renders the page containing all info of the logged user
 * in order to see and modify them.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/
import React, { useState, useEffect } from 'react';
import { executeNetworkOperation, getAuthUserFromToken, buildAuthHeader, saveAuthToken } from '../../utils/utils';
import Modal from 'react-bootstrap/Modal';
import './UserInfo.css';
import * as icons from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';

/******** Component Definition  *************************************************/
/**
 * UserInfo
 * This component renders the info received from db of the logged user
 * and shows them in order to modify some of them. 
 * @returns Instantiation of the elements that contain the user information.
 */


const UserInfo = () => {

    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [selectedUrl, setSelectedUrl] = useState("");
    const [isClicked, setIsClicked] = useState(false);
    const [size, setSize] = useState('large');
    const [newPassword, setNewPassword] = useState("");
    const [currentUser, setCurrentUser] = useState({
        firstName : "",
        lastName : "",
        email: "",
        avatar: ""
    })
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [selectedItem, setSelectedItem] = useState();
    const PROPIC_ARRAY = [
                            "https://res.cloudinary.com/dw4mygxon/image/upload/v1714379845/2school/user_avatar/avatar_default_ojberb.png",
                            "https://res.cloudinary.com/dw4mygxon/image/upload/v1713734792/2school/user_avatar/default_avatar_llwfdn.png",
                            "https://res.cloudinary.com/dw4mygxon/image/upload/v1714379736/2school/user_avatar/avatar_female_bw_hdb9ie.png",
                            "https://res.cloudinary.com/dw4mygxon/image/upload/v1714337358/2school/user_avatar/female-avatar.png",
                            "https://res.cloudinary.com/dw4mygxon/image/upload/v1714380759/2school/user_avatar/avatar_male_bw_2_ne56bt.png",
                            "https://res.cloudinary.com/dw4mygxon/image/upload/v1714381206/2school/user_avatar/avatar_female_colour_opxmau.png",
                            "https://res.cloudinary.com/dw4mygxon/image/upload/v1714381208/2school/user_avatar/avatar_male_colour_o8gc7w.png",
                            "https://res.cloudinary.com/dw4mygxon/image/upload/v1714381211/2school/user_avatar/avatar_male_bw_ebbyc6.png",
                            "https://res.cloudinary.com/dw4mygxon/image/upload/v1714381215/2school/user_avatar/avatar_male_colour_2w_kkdlnl.png",
                            "https://res.cloudinary.com/dw4mygxon/image/upload/v1714381219/2school/user_avatar/avatar_female_colour_2_rggkim.png"
                        ];

    /**
     * This function allows to save the selected avatar image for later use in patch request 
     * and adds a border to the selected image.
     * @param {*} e event fired by on click
     * @param {*} index position of the selected image in the PROPIC_ARRAY
     */
    const handleSelectedPropic = (e, index) => {

        if(!selectedItem) {
            setSelectedItem(e.target);
            e.target.classList.add('selected-propic');
        } else {
            selectedItem.classList.remove('selected-propic');
            e.target.classList.add('selected-propic');
            setSelectedItem(e.target);
        }
        setSelectedUrl(PROPIC_ARRAY[index])
    }

    /**
     * This function handles the network patch to modify the user avatar. To do that token validity is checked,
     * and if okay, it is added to the request. If the request is successful, the updated user object is returned
     * along with a new generated token (needed since the token also included the user avatar).
     */
    const handleModifiedPropic = async () => {

        let { token, decodedUser } = getAuthUserFromToken();
        
        if(!token){
            alert("Cannot retrieve user information. Please login again.")
            navigate("/login");
        } else {
            let tokenUserId = decodedUser.userId;
            const payload = {
                "avatar" : selectedUrl
            };

            let outputRes = 
            await executeNetworkOperation(
                "patch",
                `/modifyUser/${tokenUserId}`,
                payload,
                buildAuthHeader(token)
            )
            console.log(outputRes)

            if(outputRes.data.statusCode === 200){
                alert(outputRes.data.message)
                setCurrentUser({
                    firstName: outputRes.data.updatedUser.firstName,
                    lastName : outputRes.data.updatedUser.lastName,
                    email: outputRes.data.updatedUser.email,
                    avatar: outputRes.data.updatedUser.avatar
                })
                handleClose();
                saveAuthToken(outputRes.headers.getAuthorization())
            } else {
                alert(outputRes.data.message)
                if(outputRes.data.tokenExpired){
                    navigate("/login");
                }
            }
        }        
    }

    /**
     * This function toggles status isClicked in order to show or hide 
     * the input field to change current password.
     */
    const handleChangePassword = () => {
        setIsClicked(!isClicked)
    }

    /**
     * This function saves the content of the new password input field 
     * for later use in patch request.
     * @param {*} ev event fired by on change
     */
    const handleInputPswdChange = (ev) => {
        setNewPassword(ev.target.value);
    }

    /**
     * This function handles the network patch to modify the user password. To do that token 
     * validity is checked, and if okay, it is added to the request. If a new password is added 
     * and the request is successful, the password field is emptied.
     */
    const handleSaveNewPassword = async () => {

        let { token, decodedUser } = getAuthUserFromToken();
        
        if(!token){
            alert("Cannot retrieve user information. Please login again.")
            navigate("/login");
        } else {
            let tokenUserId = decodedUser.userId;
            const payload = {
                "password" : newPassword
            };

            if(newPassword !== "") {
                let outputRes = 
                await executeNetworkOperation(
                    "patch",
                    `/modifyUser/${tokenUserId}`,
                    payload,
                    buildAuthHeader(token)
                )

                alert(outputRes.data.message);
                if(outputRes.data.tokenExpired){
                    navigate("/login");
                }
                handleChangePassword()
                setNewPassword("")
            } else {
                alert("New password cannot be empty.")
            }
           
        }
    }

    /**
     * This function handles the get request to get all user information. To do that token 
     * validity is checked, and if okay and the request is successful, the updated user object is returned.
     */
    const getUserInfo = async () => {        
        
        let { token, decodedUser } = getAuthUserFromToken();

        if(!token){
            alert("Cannot retrieve user information. Please login again.")
            navigate("/login");
        } else {
            let tokenUserId = decodedUser.userId;
            let outputRes = 
                await executeNetworkOperation(
                    "get",
                    `/getUser/${tokenUserId}`,
                    "",
                    buildAuthHeader(token)
            )
            console.log(outputRes)
            
            if(outputRes.data.statusCode === 200){
                setCurrentUser({
                    firstName: outputRes.data.payload.firstName,
                    lastName : outputRes.data.payload.lastName,
                    email: outputRes.data.payload.email,
                    avatar: outputRes.data.payload.avatar
                })
            } else {
                alert(outputRes.data.message)
                if(outputRes.data.tokenExpired){
                    navigate("/login");
                }
            }            
        }        
    }
    /**
     * Needed to trigger getUserInfo function at the first rendering of the user info page.
     */
    useEffect(() => {
        getUserInfo();
    }, []);

    return(
        <>
            <div className = 'container-userInfo'>
                <h2>User Information</h2>
                <div className="user-info">
                    <div className="avatar">
                        <img src={currentUser.avatar} alt="User Avatar" />
                        <div id = 'modal-launch'>
                            <button 
                                variant="primary" 
                                onClick={handleShow} 
                                className = 'propic-button'
                            >
                                <icons.PencilSquare />
                            </button>
                        </div>
                    </div>
                    
                    <div className="info-details">
                        <div className="info-item">
                            <label htmlFor="firstname">ℹ️First Name:</label>
                            <span id="firstname">{currentUser.firstName}</span>
                        </div>
                        <div className="info-item">
                            <label htmlFor="lastname">ℹ️Last Name:</label>
                            <span id="lastname">{currentUser.lastName}</span>
                        </div>
                        <div className="info-item">
                            <label htmlFor="email">📧Email:</label>
                            <span id="email">{currentUser.email}</span>
                        </div>
                        <div className = 'button-pswd'>
                            <button 
                                type = 'button'
                                onClick = {handleChangePassword}
                            >
                                {
                                    isClicked ? "Close" : "Change password"
                                }
                            </button>
                        </div>

                    </div>
                </div>
                
                {
                        isClicked ?    
                            <div className = 'change-psw-section'>
                                <input 
                                    type = 'password' 
                                    placeholder = 'Insert your new password'
                                    className = 'input-change-psw'
                                    onChange = {handleInputPswdChange}
                                >
                                    </input> 
                                    <Button 
                                        type = "primary" 
                                        shape = "round" 
                                        size = {size}  
                                        className = 'button-password'
                                        onClick = {handleSaveNewPassword}
                                    >
                                        Save changes
                                    </Button>
                                </div>
                        : ""
                    }
                

                    <Modal 
                        show={show} 
                        onHide={handleClose}
                    >
                        <Modal.Header closeButton>
                        <Modal.Title>Avatars</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Choose your favourite avatar:</p>
                            {
                                PROPIC_ARRAY.map(urlPropic => 
                                    <img 
                                        key = {PROPIC_ARRAY.indexOf(urlPropic)}
                                        className = 'user-propic'  
                                        src = {urlPropic} 
                                        alt="avatar" 
                                        onClick = {((e) => handleSelectedPropic(e, PROPIC_ARRAY.indexOf(urlPropic)))}
                                    />
                                )
                            }
                          
                        </Modal.Body>
                        <Modal.Footer>
                        <Button 
                            variant="secondary" 
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                        <Button type="primary" shape="round" size={size} onClick={handleModifiedPropic}>
                            Save changes
                        </Button>
                        </Modal.Footer>
                    </Modal>
            </div>
        </>
    )
}


export default UserInfo;