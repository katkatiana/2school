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
const AdminModel = require('../models/admin');
const jwt = require('jsonwebtoken');


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
            user = await AdminModel.findById(userId);
            if(user){
                userCategory = info.ADMIN_CATEGORY_ID;
            } else {
                userCategory = info.UNKNOWN_CATEGORY_ID;
            }            
        }
    }

    return { 
        user: user,
        userCategory: userCategory
    }
}

const getUserObjFromToken = async (req) => {
    const token = req.headers['authorization'];
    console.log(req.authUserObj);
    return await jwt.decode(token);
}

const checkIdConsistency = (userId, targetObj, propertyNameArray) =>
{
    let returnFlag = false;

    propertyNameArray.map(p => {
        const targetPropertyArray = targetObj[p];
        if(targetPropertyArray){
            targetPropertyArray.map(obj => {
                if(obj._id.toString() === userId){
                    returnFlag = true;
                    return;
                }
            });
        }
    });
    console.log("[checkIdConsistency] Check that userId:"+userId+" is contained in the properties of object:\n"+targetObj+"\ncheckIdConsistency RESULT: " +returnFlag);
    return returnFlag;

}


/******** Export Section  *******************************************************/

module.exports = {
    sendResponse: sendResponse,
    findUserCategory: findUserCategory,
    getUserObjFromToken : getUserObjFromToken,
    checkIdConsistency : checkIdConsistency
}
