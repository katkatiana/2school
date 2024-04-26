import axios from 'axios';

const executeNetworkOperation = async (inputMethod, inputUrl, inputData, inputHeaders) => {
    let outputRes;
    await axios(
        {
            method: inputMethod,
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

export default executeNetworkOperation;