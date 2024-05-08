/**
 * @fileoverview class.js
 * This route contains all routing methods that handle classroom related operations.
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

router.post('/addReport/:classId', verifyToken, async (req, res) => {
    const content = req.body.content;
    const teacherId = req.body.teacherId;
    const studentId = req.body.studentId;

    const {classId} = req.params;
    let newReport;

    try{
        const classObj = await ClassModel.findById(classId);

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
    } catch (e) {
        console.log(e);
        tools.sendResponse(res, 500, e.message);        
    }
})

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
                        let dfStudentId = df.studentId._id;

                        if(dfStudentId && dfStudentId.toString().length > 0){ // report for the student
                            if(dfStudentId.toString() === userIdFromToken.toString()){
                                outputArray.push(df);
                            }
                        }
                        
                        if(dfStudentId && dfStudentId.toString().length === 0){ // report for the class
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