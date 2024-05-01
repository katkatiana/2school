/**
 * @fileoverview utils.js
 * This file contains utility methods used throughout the projects' files.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const info = require('./info');
const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');


/******** Functions Section  *******************************************************/

const sendResponse = (res, statusCode, message, payloadName, payload, headers) => {
    let responseContent = {
        statusCode: statusCode,
        message: message
    };
    if(payloadName && payload) {
        responseContent[payloadName] = payload;
    }
    if(headers){
        res
        .header(headers)
        .status(statusCode)
        .send(responseContent)
    } else {
        res
        .status(statusCode)
        .send(responseContent)       
    }

}


const findUserCategory = async (userId) => {

    let userCategory;
    let user;

    user = await TeacherModel.findById(userId);

    if(user) {
        userCategory = info.TEACHER_CATEGORY_ID;

    } else {
        user = await StudentModel.findById(userId);
        if(user) {
            userCategory = info.STUDENT_CATEGORY_ID;
        } else {
            userCategory = info.UNKNOWN_CATEGORY_ID;
        }
    }

    return { 
        user: user,
        userCategory: userCategory
    }
}

/******** Export Section  *******************************************************/

module.exports = {
    sendResponse: sendResponse,
    findUserCategory: findUserCategory
}
