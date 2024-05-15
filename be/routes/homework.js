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
/**
 * @openapi
 * '/addHomeworkToClass':
 *  post:
 *     tags:
 *     - Teacher routes
 *     summary: Creates a new homework and adds it to the given class.
 *     description: Creates a new homework object by specifying the author teacher ID), the subject and the class to which the homework has to be added. Optionally, the homework can be created by providing a file attachment. If present, this file will be uploaded to the configured Cloud storage service and the returned URL will be used and stored in the database. If the homework contains an attachment, the request must be sent as multipart/form-data, otherwise it can be sent as application/json. This operation requires a valid access token.
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema: 
 *         type: string
 *         description: the ID of the classroom to which the homework has to be added.
 *       - in: body
 *         name: body
 *         description: The body containing the homework details.
 *         schema:
 *           type: object
 *           required:
 *             - content
 *             - teacherId
 *             - subjectId
 *           properties:
 *             content:
 *               type: string
 *               description: The content of the homework.
 *               example: Study page 322
 *             teacherId:
 *               type: string
 *               description: The Alphanumeric ID of the teacher that created the homework.
 *             subjectId:
 *               type: string
 *               description: The Alphanumeric ID of the subject associated to the homework.
 *             attachment:
 *               type: string
 *               format: binary
 *               description: An optional file attachment that complements the homework.
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Homework was added successfully, and is returned in the response.
 *      400:
 *         description: Provided input parameters are not correct.
 *      401:
 *        description: Access token is expired, or the current user is not authorized to access this route.
 *      500:
 *        description: Internal Server Error
 */
router.post('/addHomeworkToClass', verifyToken, handleHomeworkUpload, validateHomework, async (req, res) => {


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

/**
 * @openapi
 * '/getHomeworks/:classId':
 *  get:
 *     tags:
 *     - Generic User routes
 *     summary: Retrieve all homeworks that belong to the classroom.
 *     description: Retrieves all the homeworks belonging to the given classroom, identified by the input classID. This operation requires a valid access token.
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *         type: string
 *         required: true
 *         description: Alphanumeric ID of the classroom whose homeworks are to be fetched.
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Homeworks fetched successfully, and returned in the payload of the response.
 *      400:
 *        description: Provided input parameters are not correct.
 *      401:
 *        description: Access token is expired, or the current user is not authorized to access this route.
 *      404:
 *        description: Specified class ID is not corresponding to any existing classroom.
 *      500:
 *        description: Server Error
 */
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
                tools.sendResponse(res, 404, 'Specified class was not found.');
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


