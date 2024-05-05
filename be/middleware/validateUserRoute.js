/**
 * @fileoverview validateUSerRoute.js
 * This middleware is responsible of defining methods related to validation of user routes.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');
const SubjectModel = require('../models/subject');
const ClassModel = require('../models/class');
const HomeworkModel = require('../models/homework');
const DisciplinaryFileModel = require('../models/disciplinaryFile');
const tools = require('../utils/utils');
const info = require('../utils/info');
const upload = require('../middleware/handleHomeworkUpload');
const deletetools = require('../middleware/validateItemToDelete');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require("path");
const bcrypt = require('bcrypt');

/********************************** Function section *************************************************/

/**
 * validateUserToModify
 * This middleware controls every param of the body object contained in the homework add request, 
 * and allows to specify what kind of characteristics they need to have in order to advance the request to 
 * the next middleware.
 * Occurred errors, if any, are sent as an array in the response.
 * @param {*} req the incoming request. Contains the user body to be validated.
 * @param {*} res the outgoing response. It is sent with error 400 in case any error occurred.
 * @param {*} next allows to advance to the next middleware, but only if no error occurred before.
 */
const validateUserToModify = async (req, res, next) => {
    let errors = [];
    const userFromToken = req.authUserObjFromToken; //from verifyToken
    const userCategoryFromToken = userFromToken.userCategory; //from verifyToken
    const userIdToModify = req.params.userId;
    let userFromDb;
    let userCategoryFromDb;
    let userIdCheck = false;
    let paramsToModify = [];
    let targetDbModel;
    let recomputeAccessToken;


    if(!userIdToModify){
        errors.push("You must provide the user id to be modified.");
    }

    if(userIdToModify){

        let {user, userCategory} = await tools.findUserCategory(userIdToModify.toString());
        userFromDb = user;
        userCategoryFromDb = userCategory;
        if(!user){
            errors.push("Specified user was not found.");
        }
    }


    if(userCategoryFromDb){
        if(userCategoryFromDb === info.TEACHER_CATEGORY_ID){
            targetDbModel = TeacherModel;
        } else if(userCategoryFromDb === info.STUDENT_CATEGORY_ID){
            targetDbModel = StudentModel;
        } else {
            console.log("Not possible!")
            // not possible
        }
        
    }

    if(userIdToModify){
        let userIdFromToken = userFromToken.userId;
        let userIdFromDbToModify = userFromDb._id;

        if(userIdFromToken.toString() === userIdFromDbToModify.toString()){
            userIdCheck = true;
        }

        if(userCategoryFromToken === info.ADMIN_CATEGORY_ID){
            userIdCheck = true; //admin can modify also other users
            recomputeAccessToken = false; // admin modifications should not trigger token recomputation
        } else {
            recomputeAccessToken = true; //user modification should trigger token recomputation
        }

        if(!userIdCheck){
            errors.push("Target user Id does not match with the user Id provided in the authentication token.");
        }
    }

    if((userCategoryFromToken === info.TEACHER_CATEGORY_ID) ||
       (userCategoryFromToken === info.STUDENT_CATEGORY_ID)){
        //ALLOWED MODIFICATIONS: AVATAR AND/OR PASSWORD
        
        if(req.body['avatar']){
            newContent = {
                avatar : req.body.avatar
            };
            paramsToModify.push(newContent);
        }
        
        if(req.body['password']){
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
            newContent = {
                pswHash : hashedPassword
            };
            paramsToModify.push(newContent);
        }

    } else if(userCategoryFromToken === info.ADMIN_CATEGORY_ID){

        //ALLOWED MODIFICATIONS: all
        if(req.body['firstName']){
            newContent = {
                firstName : req.body.firstName
            };
            paramsToModify.push(newContent);
        }

        if(req.body['lastName']){
            newContent = {
                lastName : req.body.lastName
            };
            paramsToModify.push(newContent);
        }

        if(req.body['email']){
            newContent = {
                email : req.body.email
            };
            paramsToModify.push(newContent);
        }

        if(req.body['avatar']){
            newContent = {
                avatar : req.body.avatar
            };
            paramsToModify.push(newContent);
        }
        
        if(req.body['password']){
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
            newContent = {
                pswHash : hashedPassword
            };
            paramsToModify.push(newContent);
        }
    }

    if(paramsToModify.length === 0){
        errors.push("You must provide parameters to be modified!")
    }

    if(errors.length > 0){
        tools.sendResponse(res, 500, "User update failed due to validation errors.", "errors", errors)
        console.log("[validateUserToModify] Failed with errors:\n", errors);
    } else {
        req.targetModelForModify = targetDbModel; // so the next code knows about the model on which the delete is to be performed
        req.recomputeAccessToken = recomputeAccessToken;
        req.targetUserCategory = userCategoryFromDb;
        if(paramsToModify.length > 1){
            let resultObject = paramsToModify.reduce(function(result, currentObject) {
                for(var key in currentObject) {
                    if (currentObject.hasOwnProperty(key)) {
                        result[key] = currentObject[key];
                    }
                }
                return result;
            }, {});
            req.paramsToModify = resultObject;
        } else {
            req.paramsToModify = paramsToModify[0];
        }
        next();
    }
}

const validateUserToDelete = async (req, res, next) => {
    let errors = [];
    const userFromToken = req.authUserObjFromToken; //from verifyToken
    const userIdToDelete = req.params.userId;
    let userFromDb;
    let userCategoryFromDb;
    let targetDbModel;

    if(!userIdToDelete){
        errors.push("You must provide the user id to be deleted.");
    }

    if(userIdToDelete){

        let {user, userCategory} = await tools.findUserCategory(userIdToDelete.toString());
        userFromDb = user;
        userCategoryFromDb = userCategory;
        if(!user){
            errors.push("Specified user was not found.");
        }
    }


    if(userCategoryFromDb){
        if(userCategoryFromDb === info.TEACHER_CATEGORY_ID){
            targetDbModel = TeacherModel;
        } else if(userCategoryFromDb === info.STUDENT_CATEGORY_ID){
            targetDbModel = StudentModel;
        } else {
            console.log("Not possible!")
            // not possible
        }
        
    }

    if(errors.length > 0){
        tools.sendResponse(res, 500, "User delete failed due to validation errors.", "errors", errors)
        console.log("[validateUserToDelete] Failed with errors:\n", errors);
    } else {
        req.targetModelForModify = targetDbModel; // so the next code knows about the model on which the delete is to be performed
        req.targetUserCategory = userCategoryFromDb;
        next();
    }
}

module.exports = {
    validateUserToModify : validateUserToModify,
    validateUserToDelete : validateUserToDelete
};

