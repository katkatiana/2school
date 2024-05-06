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
    const {
        content,
        teacherId,
        studentId
    } = req.body

    const {classId} = req.params;
    let newReport;

    try{
        const classObj = await ClassModel.findById(classId);

   
        newReport = {
                content: content,
                teacherId : teacherId,
                studentId : studentId,
        };            
    
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


module.exports = router;