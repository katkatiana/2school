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
/** GET Methods */
/**
 * @openapi
 * '/getSubjects/:teacherId':
 *  get:
 *     tags:
 *     - Generic User routes
 *     summary: Retrieves all the subjects that are currently associated to the teacher whose id is given as input parameter. 
 *     description: If the current requesting user (from access token) is a teacher, only its associated subjects are retrieved. If it's an admin, all the existing subjects in the database are returned. This operation requires a valid access token.
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         schema:
 *         type: string
 *         required: true
 *         description: Alphanumeric ID of the teacher whose subjects are to be retrieved.
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Fetched successfully. The returned subjects are contained in the payload of the response.
 *      401:
 *        description: Access token is expired, or the current user is not authorized to access this route.
 *      404:
 *        description: The specified teacher Id does not correspond to a known teacher.
 */
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
