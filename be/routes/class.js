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
const ClassModel = require('../models/class');
const SubjectModel = require('../models/subject');
const verifyToken = require('../middleware/verifyToken');
const tools = require('../utils/utils');
const info = require('../utils/info');

/******** Function Section  ****************************************************/

/** GET Methods */
/**
 * @openapi
 * '/getClasses/:userId':
 *  get:
 *     tags:
 *     - Get User classrooms IDs
 *     summary: Retrieve all the classroom IDs of the classes that are associated to a given user, specified by userId.
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *         type: string
 *         required: true
 *         description: Alphanumeric ID of the user
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Fetched Successfully. Returns an array with the IDs of the associated Classes.
 *      401:
 *        description: Authorization was not successful.
 *      500:
 *        description: Internal Server Error.
 */
router.get('/getClasses/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    try{
        const userFromToken = req.authUserObjFromToken;
        let classes;
        if(userFromToken.userCategory === info.TEACHER_CATEGORY_ID){
            classes = await ClassModel.find(
                {
                    teachersId: {
                        $elemMatch: { $eq: userId }
                    }
                }
            )
        } else if(userFromToken.userCategory === info.STUDENT_CATEGORY_ID){
            classes = await ClassModel.find(
                {
                    studentsId: {
                        $elemMatch: { $eq: userId }
                    }
                }
            ).populate({
                path: 'teachersId',
                populate: {
                    path: "subjectsId",
                    model: SubjectModel
                }                
            }).exec();         
        } else {
            classes = await ClassModel.find({});
        }
        
        let classOutputArray = [];
    
        if(classes.length > 0){
            classes.map(singleClass => {
                let classOutputItem = {
                    _id : singleClass._id,
                    section: singleClass.section,
                    gradeOfClass: singleClass.gradeOfClass,
                    logo: singleClass.logo,
                    teachers: singleClass.teachersId
                }
                classOutputArray.push(classOutputItem);
            });
            console.log(classOutputArray);
        } 
            
        tools.sendResponse(res, 200, "Completed successfully.", "payload", classOutputArray)
        
    } catch (e) {
        console.log(e)
        tools.sendResponse(res, 500, "Internal Server Error."); 
    }
})

/**
 * @openapi
 * '/getClass/:classId':
 *  get:
 *     tags:
 *     - Get details of a given classroom
 *     summary: Retrieve all the details of a classroom with the given classID. You can view the classroom details only if you are part of it (either as a student or as a teacher).
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *         type: string
 *         required: true
 *         description: Alphanumeric ID of the classroom
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Fetched Successfully. Returns a fully-qualified Class Object with all the references already resolved.
 *      401:
 *        description: Authorization was not successful.
 *      404:
 *        description: Specified classroom was not found in the database.
 *      500:
 *        description: Internal Server Error.
 */
router.get('/getClass/:classId', verifyToken, async (req, res) => {
    const { classId } = req.params;

    try{

        const classObj = 
        await ClassModel.findById(classId)
                        .populate('teachersId')
                        .populate('studentsId')
                        .populate({
                            path: 'homeworkId',
                            populate: {
                                path: "subjectId",
                                model: SubjectModel
                            }
                        })
                        .populate({
                            path: 'homeworkId',
                            populate: {
                                path: "teacherId",
                                model: TeacherModel
                            }
                        })
                        .populate('disciplinaryFileId')
                        .exec();
        if(!classObj){
            tools.sendResponse(res, 404, "Specified Classroom was not found.")
        } else {

            const userObjFromToken = req.authUserObjFromToken;
            const userCategory = userObjFromToken.userCategory;
            let consistencyCheck = false;
    
            if((userCategory === info.TEACHER_CATEGORY_ID) || 
               (userCategory === info.STUDENT_CATEGORY_ID)){
                // Check that the requested class object info is a class that actually contains the user 
                // in either students or teachers 
                consistencyCheck = tools.checkIdConsistency(
                    userObjFromToken.userId,
                    classObj,
                    ['teachersId', 'studentsId']
                );
    
            } else {
                // admins should not perform any check
                consistencyCheck = true;
            }

            if(userCategory === info.STUDENT_CATEGORY_ID){
                // student can only see himself in the class object
                let studentsOfClass = classObj.studentsId;
                studentsOfClass.map((st => {
                    if(st._id.toString() !== userObjFromToken.userId.toString()){
                        let elemIndex = studentsOfClass.indexOf(st);
                        studentsOfClass.splice(elemIndex, 1);
                    }
                }))
            }

            if(consistencyCheck){
                tools.sendResponse(res, 200, "Data retrieved successfully", "payload", classObj)
            } else {
                tools.sendResponse(res, 401, "Requested operation is not permitted.");
            }            
        }
    }catch(e){
        console.log(e)
        tools.sendResponse(res, 500, "Internal Server Error.");
    }   
})


module.exports = router;