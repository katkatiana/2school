/**
 * @fileoverview homework.js
 * This route contains all routing methods related to homework management.
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
const SubjectModel = require('../models/subject');
const ClassModel = require('../models/class');
const tools = require('../utils/utils');
const info = require('../utils/info');
const { findOneAndUpdate } = require('../models/subject');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const validateHomework = require('../middleware/validateHomework');
const handleHomeworkUpload = require('../middleware/handleHomeworkUpload');

/******** Function Section  ****************************************************/

router.post('/addHomeworkToClass', verifyToken, handleHomeworkUpload, validateHomework, async (req, res) => {

    /**
     * POST payload structured in this way:
     * {
     *     content: string
     *     teacherId : string
     *     subjectId : string
     *     classId : string
     * }
     */

    /* If we are here it means the payload and the token are valid. */
    const contentType = req.headers["content-type"];
    const {
        content,
        teacherId,
        subjectId,
    } = req.body

    const classId = req.query.classId;
    let newHomework;

    try{
        const classObj = await ClassModel.findById(classId);

        if(contentType.includes("multipart/form-data")){
            newHomework = {
                content: content,
                teacherId : teacherId,
                subjectId : subjectId,
                attachment : req.file.path
            };
        } else {
            newHomework = {
                content: content,
                teacherId : teacherId,
                subjectId : subjectId,
            };            
        }
    
        let newHomeworkDb = new HomeworkModel(newHomework);
        let hwSaveResult = await newHomeworkDb.save();
        if(hwSaveResult){
            // assign the homework to the class
            classObj.homeworkId.push(hwSaveResult._id);
            let classSaveResult = await classObj.save();
            if(classSaveResult){
                tools.sendResponse(res, 200, "Homework was added successfully.", "payload", hwSaveResult); 
            } else {
                throw new Error("Cannot update new homework in class.")
            }
        }  else {
            throw new Error("Cannot save new homework.")
        }        
    } catch (e) {
        console.log(e);
        tools.sendResponse(res, 500, e.message);        
    }
})

router.get('/getHomeworks/:classId', verifyToken, async (req, res) => {
    const {classId} = req.params;

    try{

        if(!classId){
            tools.sendResponse(res, 400, 'You must provide valid class Id.');
        } else {
            let classObj = await ClassModel.findById(classId)
            .populate({
                path: 'homeworkId',
                populate: {
                    path: "teacherId",
                    model: TeacherModel
                }                
            })
            .populate({
                path: 'homeworkId',
                populate: {
                    path: "subjectId",
                    model: SubjectModel
                }               
            });           

            if(!classObj){
                tools.sendResponse(res, 400, 'Specified class was not found.');
            } else {
                let homeworkArray = classObj.homeworkId;
                let outputArray = [];

                outputArray = homeworkArray;

                tools.sendResponse(res, 200, "Homeworks fetched successfully", "payload", outputArray);
            }
        }

    } catch (e) {
        console.log(e);
        if(e.message){
            tools.sendResponse(res, 500, e.message);
        } else {
            tools.sendResponse(res, 500, 'Internal Server Error')
        }        
    }
});

module.exports = router;


