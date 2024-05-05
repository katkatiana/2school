/**
 * @fileoverview admin.js
 * This route contains all routing methods related to admin operations.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');
const HomeworkModel = require('../models/homework');
const ClassModel = require('../models/class');
const DisciplinaryFileModel = require('../models/disciplinaryFile')
const tools = require('../utils/utils');
const info = require('../utils/info');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const usertools = require('../middleware/validateUserRoute');

/******** Function Section  ****************************************************/

router.get('/getAllUsers', verifyToken, async (req, res) => {
    
    const requestedUserCategory = req.query.category;
    let targetDbModel;
    try{

        if(!requestedUserCategory){
            throw new Error("User Category is missing.")
        } else {
            if(requestedUserCategory.toString() === info.TEACHER_CATEGORY_ID.toString()){
                targetDbModel = TeacherModel;
            } else if(requestedUserCategory.toString() === info.STUDENT_CATEGORY_ID.toString()){
                targetDbModel = StudentModel;
            } else {
                // not covered
                throw new Error("Unrecognized category.")
            }
    
            let userListFromDb = await targetDbModel.find({});
    
            if(userListFromDb){
                tools.sendResponse(res, 200, 'User List retrieved successfully', "payload", userListFromDb);    
            } else {
                throw new Error("Unable to fetch requested user list.");
            }    
        }

    } catch(e) {
        console.log(e);
        if(e.message){
            tools.sendResponse(res, 500, e.message);
        } else {
            tools.sendResponse(res, 500, 'Internal Server Error.');
        }        
    }
});

router.delete('/deleteUser/:userId', verifyToken, usertools.validateUserToDelete, async (req, res) => {

    const { userId } = req.params;
    const targetModelForModify = req.targetModelForModify; // added by validateItemToModify middleware
    const targetUserCategory = req.targetUserCategory;
    try{
   
        let deleteResult = await targetModelForModify.findOneAndDelete({_id: userId});
        
        if(deleteResult){
            console.log(userId);
            
            // check if the deleted user was the author of some homeworks. If yes, delete them.
            let homeworksFromDeletedUser = await HomeworkModel.find({teacherId : userId});

            let disciplinaryFilesFromDeletedUser = await DisciplinaryFileModel.find({teacherId : userId});

            let classes = await ClassModel.find(
                {
                    teachersId: {
                        $elemMatch: { $eq: userId }
                    }
                }
            )
            
            if(homeworksFromDeletedUser && homeworksFromDeletedUser.length > 0){
                homeworksFromDeletedUser.map(async hm => {
                    await HomeworkModel.findByIdAndDelete(hm._id);
                });
            }

            if(disciplinaryFilesFromDeletedUser && disciplinaryFilesFromDeletedUser.length > 0){
                disciplinaryFilesFromDeletedUser.map(async df => {
                    await DisciplinaryFileModel.findByIdAndDelete(df._id);
                });
            }

            if(classes && classes.length > 0){
                classes.map(async cl => {
                   if(targetUserCategory === info.TEACHER_CATEGORY_ID){
                        propertyName = "teachersId";
                   } else {
                        propertyName = "studentsId"
                   }
                   let elemIndex = cl[propertyName].indexOf(userId);
                   cl[propertyName].splice(elemIndex, 1);
                   await cl.save();
                });                
            }

            tools.sendResponse(res, 200, 'Deleted successfully.');            
        } else {
            console.log(deleteResult);
            throw new Error ("Requested user delete operation failed, please try again.");
        }

    } catch(e){
        console.log(e)
        tools.sendResponse(res, 500, 'Internal Server Error')
    }
})

module.exports = router;


