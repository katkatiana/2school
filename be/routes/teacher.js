/**
 * @fileoverview teacher.js
 * This route contains all routing methods related to teachers.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const TeacherModel = require('../models/teacher');
const SubjectModel = require('../models/subject');
const verifyToken = require('../middleware/verifyToken');
const tools = require('../utils/utils');
const info = require('../utils/info');

/******** Function Section  ****************************************************/

router.get('/getSubjects/:teacherId', verifyToken, async (req, res) => {
    const { teacherId } = req.params;
    const userFromToken = req.authUserObjFromToken;
    if(userFromToken.userCategory === info.ADMIN_CATEGORY_ID){
        let allSubj = await SubjectModel.find({});
        if(!allSubj){
            tools.sendResponse(res, 404, "Error in retrieving subjects.")
        } else {
            tools.sendResponse(res, 200, "Success", "payload", allSubj);
        }
    } else {
        const teacherObj = await TeacherModel.findOne({_id: teacherId}).populate('subjectsId').exec()
        if(!teacherObj){
            tools.sendResponse(res, 404, "Specified teacher was not found.")
        } else {
            console.log(teacherObj)
            tools.sendResponse(res, 200, "Success", "payload", teacherObj.subjectsId);
        }
    }
});


module.exports = router;
