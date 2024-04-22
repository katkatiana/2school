/**
 * @fileoverview utils.js
 * This file contains utility methods used throughout the projects' files.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Functions Section  *******************************************************/

const sendResponse = (res, statusCode, message, payloadName, payload) => {
    let responseContent = {
        statusCode: statusCode,
        message: message
    };
    if(payloadName && payload) {
        responseContent[payloadName] = payload;
    }
    res
        .status(statusCode)
        .send(responseContent)
}

/******** Export Section  *******************************************************/

module.exports = {
    sendResponse: sendResponse,
}
