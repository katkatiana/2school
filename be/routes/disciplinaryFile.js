/**
 * @fileoverview disciplinaryFile.js
 * This route contains all routing methods that handle add/get of disciplinary reports.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const express = require('express');
const router = express.Router();
const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');
const DisciplinaryFileModel = require('../models/disciplinaryFile');
const ClassModel = require('../models/class');
const verifyToken = require('../middleware/verifyToken');
const tools = require('../utils/utils');
const info = require('../utils/info');

/******** Function Section  ****************************************************/

/**
 * @openapi
 * '/addReport/:classId':
 *  post:
 *     tags:
 *     - Teacher routes
 *     summary: Creates a new disciplinary report.  
 *     description: Creates a new disciplinary report, specifying its content and issuing teacher by teacherId. If the student ID is provided in the body then the report will be addressed to that student, otherwise it will be addressed to the specified classroom.  empty classroom, so no teacher or students are added to it. This operation requires a valid access token.
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *         type: string
 *         required: false
 *         description: Alphanumeric ID of the classroom to which the report is to be added.
 *       - in: body
 *         name: body
 *         description: Body of the report to be created.
 *         schema:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *               description: Content of the report.
 *               example: John Doe was very bad today
 *             teacherId:
 *               type: string
 *               description: Alphanumeric ID of the teacher issuing the report.
 *             studentId:
 *               type: string
 *               description: Alphanumeric ID of the student receiving the report (optional, if not present the report is addressed to the entire classroom).
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Report was created successfully and is returned in the response.
 *      400:
 *         description: Provided input parameters are not correct.
 *      401:
 *        description: Access token is expired, or the current user is not authorized to access this route.
 *      404:
 *         description: Specified classroom, teacher or student was not found.
 *      500:
 *        description: Internal Server Error
 */
router.post('/addReport/:classId', verifyToken, async (req, res) => {
    const content = req.body.content;
    const teacherId = req.body.teacherId;
    const studentId = req.body.studentId;

    const {classId} = req.params;
    let newReport;
    let studentObj = {};

    try{

        if(!classId || !teacherId){
            tools.sendResponse(res, 400, "You must provide classId and teacherId."); 
        } else {
            const classObj = await ClassModel.findById(classId);
            const teacherObj = await TeacherModel.findById(teacherId);
            if(studentId){
                studentObj = await StudentModel.findById(studentId);
            }
            if(!classObj || !teacherObj || (studentId && !studentObj)){
                tools.sendResponse(res, 404, "Specified classroom, teacher or student was not found."); 
            } else {
                if(studentId){
                    newReport = {
                        content: content,
                        teacherId : teacherId,
                        studentId : studentId,
                    };
                } else {
                    newReport = {
                        content: content,
                        teacherId : teacherId
                    };
                }                    
            
                let newReportDb = new DisciplinaryFileModel(newReport);
                let reportSaveResult = await newReportDb.save();
                if(reportSaveResult){
                    // assign the homework to the class
                    classObj.disciplinaryFileId.push(reportSaveResult._id);
                    let classSaveResult = await classObj.save();
                    if(classSaveResult){
                        tools.sendResponse(res, 200, "Report was added successfully.", "payload", reportSaveResult); 
                    } else {
                        throw new Error("Cannot update new report in class.")
                    }
                }  else {
                    throw new Error("Cannot save new report.")
                } 
            }  
        }             
    } catch (e) {
        console.log(e);
        tools.sendResponse(res, 500, e.message);        
    }
})

/**
 * @openapi
 * '/getReports/:classId':
 *  get:
 *     tags:
 *     - Generic User routes
 *     summary: Retrieve all reports that belong to the students of the classroom.
 *     description: Retrieves all the reports belonging to the given classroom, either them be classroom-wide reports (because they do not any specify studentId) or students-focused disciplinary reports. This operation requires a valid access token.
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *         type: string
 *         required: true
 *         description: Alphanumeric ID of the classroom whose reports are to be fetched.
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
router.get('/getReports/:classId', verifyToken, async (req, res) => {
    const {classId} = req.params; 
    const userCategoryFromToken = req.authUserObjFromToken.userCategory;
    const userIdFromToken = req.authUserObjFromToken.userId;

    try{

        if(!classId){
            tools.sendResponse(res, 400, 'You must provide valid class Id.');
        } else {
            let classObj = await ClassModel.findById(classId)
            .populate({
                path: 'disciplinaryFileId',
                populate: {
                    path: "studentId",
                    model: StudentModel
                }                
            })
            .populate({
                path: 'disciplinaryFileId',
                populate: {
                    path: "teacherId",
                    model: TeacherModel
                }               
            })

            

            if(!classObj){
                tools.sendResponse(res, 400, 'Specified class was not found.');
            } else {
                let disciplinaryFileArray = classObj.disciplinaryFileId;
                let outputArray = [];

                if(userCategoryFromToken === info.STUDENT_CATEGORY_ID ){
                    disciplinaryFileArray.map(df => {

                        if(df.studentId && df.studentId._id && df.studentId._id.toString().length > 0){ // report for the student
                            if(df.studentId._id.toString() === userIdFromToken.toString()){
                                outputArray.push(df);
                            }
                        }
                        
                        if(!df.studentId){ // report for the class
                            outputArray.push(df);
                        }                        
                    });
                } else {
                    outputArray = disciplinaryFileArray;
                }

                tools.sendResponse(res, 200, "Disciplinary Reports fetched successfully", "payload", outputArray);
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