import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const executeNetworkOperation = async (inputMethod, inputUrl, inputData, inputHeaders) => {
    let outputRes;
    await axios(
        {
            method: inputMethod.toLowerCase(),
            url: process.env.REACT_APP_FRONTEND_SERVER_URL + inputUrl,
            data: inputData,
            headers: inputHeaders
        }
    )
    .then((res) => {
        outputRes = res;
    })
    .catch((err) => {
        if(err.response){
            outputRes = err.response;
        } else {
            outputRes = err
        }
    })

    return outputRes;

}


const getAuthUserFromToken = () => {

    let token = localStorage.getItem('auth');
    let decodedUser;
    if(!token){
        token = undefined;
        decodedUser = undefined;
    } else {
        decodedUser = jwtDecode(token);
        console.log(decodedUser)
    }

    return {
        token: token,
        decodedUser: decodedUser
    }
}

const buildAuthHeader = (token) => {
    return {"Authorization" : "Bearer " + token}
}

const saveAuthToken = (token) => {
    localStorage.setItem('auth', JSON.stringify(token))
}

const resetAuthToken = () => {
    if(localStorage.getItem('auth')){
        localStorage.removeItem('auth');
    }    
}

export {
    executeNetworkOperation,
    getAuthUserFromToken,
    buildAuthHeader,
    saveAuthToken,
    resetAuthToken
}