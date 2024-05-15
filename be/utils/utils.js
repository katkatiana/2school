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
/**
 * sendResponse
 * Sends the HTTP response given in input, by specifing several optional parameters.
 * @param {*} res The response object, as given by expressJS.
 * @param {*} statusCode the desired status code to be sent in the response.
 * @param {*} message (optional) the optional message to be sent along the response.
 * @param {*} payloadName (optional) name of the field that will contain user data.
 * @param {*} payload (optional) user data to be added to the response
 * @param {*} headers (optional) additional headers to be sent in the response.
 */
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

/**
 * findUserCategory
 * Given the input userId, returns the corresponding user object as
 * retrieved from the database (if existing), along with the related
 * user category.
 * @param {*} userId the ID of the user to be searched 
 * @returns an object structured in this way:
 * {
 *    user: <user object as retrieved from DB>
 *    userCategory: <user category>
 * }
 * On a failed search, the object properties will be empty.
 */
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

/**
 * getUserObjFromToken
 * Fetches the request headers for the authorization token,
 * then returns its decoded version.
 * @param {*} req the request as provided by expressJS router.
 * @returns the decoded token obtained by jwt.decode.
 */
const getUserObjFromToken = async (req) => {
    const token = req.headers['authorization'];
    console.log(req.authUserObj);
    return await jwt.decode(token);
}

/**
 * checkIdConsistency
 * Checks if the properties contained in the propertyNameArray are part of the targetObj,
 * and if yes if the provided userId is contained in them.
 * @param {*} userId the user Id to be searched.
 * @param {*} targetObj the object whose properties are to be searched
 * @param {*} propertyNameArray name of the properties to be searched in the targetObj
 * @returns true if the check is successfull, false otherwise.
 */
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
