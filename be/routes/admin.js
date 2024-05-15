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
const SubjectModel = require('../models/subject');
const ClassModel = require('../models/class');
const DisciplinaryFileModel = require('../models/disciplinaryFile')
const tools = require('../utils/utils');
const info = require('../utils/info');
const avatars = require('../utils/avatars');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const usertools = require('../middleware/validateUserRoute');

/******** Function Section  ****************************************************/
/**
 * @openapi
 * '/getAllUsers':
 *  get:
 *     tags:
 *     - Admin routes
 *     summary: Retrieves the list of all the registered users in the database. 
 *     description: Retrieves all the users registered in the database, either students or teachers. This operation requires a valid access token, and is allowed only for the admin role.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: 
 *         type: string
 *         description: the category of the user to retrieve. 345 for teachers, 589 for student, all to retrieve all the users (only for admin). 
 *         enum: ["345", "589", "all"]
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Fetched successfully. The user list is returned in the payload of the response.
 *      401:
 *        description: Access token is expired, or the current user is not authorized to access this route.
 *      500:
 *        description: Internal Server Error.
 */
router.get('/getAllUsers', verifyToken, async (req, res) => {
    
    const requestedUserCategory = req.query.category;
    let targetDbModel;
    let userListFromDb = [];
    try{

        if(!requestedUserCategory){
            throw new Error("Requested Category is missing.")
        } else {
            if(requestedUserCategory.toString() === info.TEACHER_CATEGORY_ID.toString()){
                targetDbModel = TeacherModel;
            } else if(requestedUserCategory.toString() === info.STUDENT_CATEGORY_ID.toString()){
                targetDbModel = StudentModel;
            } else if(requestedUserCategory === "all"){
                targetDbModel = [];
                targetDbModel.push(TeacherModel);
                targetDbModel.push(StudentModel);
            } else {
                // not covered
                throw new Error("Unrecognized category.")
            }

            if(requestedUserCategory.toString() === info.TEACHER_CATEGORY_ID.toString()){
                userListFromDb = await targetDbModel.find({}).populate("subjectsId").select('-pswHash').exec();
            } else if(requestedUserCategory === "all"){
                let localListOfTeachers = await TeacherModel.find({}).select('-pswHash').exec();
                let localListOfStudents = await StudentModel.find({}).select('-pswHash').exec();
                userListFromDb = localListOfTeachers.concat(localListOfStudents);
            } else {                
                userListFromDb = await targetDbModel.find({}).select('-pswHash').exec();
            }

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

/**
 * @openapi
 * '/deleteUser/:userId':
 *  delete:
 *     tags:
 *     - Admin routes
 *     summary: Deletes the user specified by the given user Id.
 *     description: Delete the user given by the corresponding user id. This also deletes all the user references contained in other objects inside the database. This operation requires a valid access token, and is allowed only for the admin role.
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *         type: string
 *         required: true
 *         description: Alphanumeric ID of the user to delete
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: User deleted successfully
 *      404:
 *        description: User not found
 *      401:
 *        description: Access token is expired, or the current user is not authorized to access this route.
 *      500:
 *        description: Internal Server Error
 * 
 */
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
            tools.sendResponse(res, 404, 'User not found.');
        }

    } catch(e){
        console.log(e)
        tools.sendResponse(res, 500, 'Internal Server Error')
    }
})

/**
 * @openapi
 * '/createClass':
 *  post:
 *     tags:
 *     - Admin routes
 *     summary: Creates a new classroom.  
 *     description: Creates a new classroom, specifying its grade and section; it is created as an empty classroom, so no teacher or students are added to it. This operation requires a valid access token, and is allowed only for the admin role.
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Grade and section of class (e.g. 2 B).
 *         schema:
 *           type: object
 *           required:
 *             - gradeOfClass
 *             - section
 *           properties:
 *             gradeOfClass:
 *               type: number
 *               minLength: 1
 *               maxLength: 1
 *               example: 2 
 *             section:
 *               type: string
 *               minLength: 1
 *               maxLength: 1
 *               example: B
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Classroom was created successfully and is returned in the response.
 *      401:
 *        description: Access token is expired, or the current user is not authorized to access this route.
 *      500:
 *        description: Internal Server Error
 */
router.post('/createClass', verifyToken, async (req, res) => { 

    const classSection = req.body.section;
    const classGrade = req.body.grade;
    try{

        let classSectionValidity = 
            classSection && classSection.length === 1;

        let classGradeValidity = 
            classGrade && classGrade.length === 1 && parseInt(classGrade, 10) > 0 && parseInt(classGrade, 10) < 6;


        if(!classSectionValidity || !classGradeValidity){
            tools.sendResponse(res, 400, 'You must provide valid section and grade of class.');
        } else {

            // check that the class is not already existing
            let dbObj = await ClassModel.find(
                {
                    section: classSection,
                    gradeOfClass : classGrade
                }
            )

            if(dbObj.length > 0){
                tools.sendResponse(res, 400, 'The specified class is already present in the database.');
            } else {
                // calculate the logo to be used
                let logoIndex = classGrade - 1;
                let logoToBeUsed = avatars.DEFAULT_CLASS_LOGOS[logoIndex];

                // create the class object
                let newClassObject = {
                    section: classSection,
                    gradeOfClass: classGrade,
                    logo: logoToBeUsed,
                    teachersId :  [],
                    studentsId : [],
                    homeworkId : [],
                    disciplinaryFileId : []
                }

                let newClassDb = new ClassModel(newClassObject);
                let newClassDbSave = newClassDb.save({new: true});

                if(newClassDbSave){
                    tools.sendResponse(res, 200, "Class successfully created.", "payload", newClassDbSave);
                } else {
                    throw new Error("Class was not saved correctly, please try again.")
                }
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

/**
 * @openapi
 * '/addUserToClass':
 *  put:
 *     tags:
 *     - Admin routes
 *     summary: Adds the user to the given classroom.
 *     description: Adds the user corresponding to the given user Id to the classroom corresponding to the given class ID. This operation requires a valid access token, and is allowed only for the admin role.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema: 
 *         type: string
 *         description: the ID of the user (teacher/student) to be added to the classroom.
 *       - in: query
 *         name: classId
 *         schema: 
 *         type: string
 *         description: the Id of the class to which the user must be added.
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Specified user was correctly added to the given classroom, and the new classroom object is returned in the payload of the response.
 *      400:
 *        description: Specified user or classroom ID was not valid.
 *      401:
 *        description: Access token is expired, or the current user is not authorized to access this route.
 *      404:
 *        description: Specified user or classroom was not found.
 *      500:
 *        description: Internal Server Error
 */
router.put('/addUserToClass', verifyToken, async (req, res) => { 

    const classId = req.query.classId;
    const userId = req.query.userId;
    try{

        if(!userId || !classId){
            tools.sendResponse(res, 400, 'You must provide valid userId and classId.');
        } else {
            let {user, userCategory} = await tools.findUserCategory(userId);
            let classFromDb = await ClassModel.find({_id : classId}).populate('studentsId').exec();

            if(!user || !classFromDb){
                tools.sendResponse(res, 404, 'Specified user or class was not found.');
            } else {
                classFromDb = classFromDb[0];
                if(userCategory === info.TEACHER_CATEGORY_ID){
                    propertyName = "teachersId";
                } else if(userCategory === info.STUDENT_CATEGORY_ID){
                    propertyName = "studentsId";
                } else {
                    console.log("Not possible!")
                    // not possible
                }
                let arrayOfClass = classFromDb[propertyName];                
                arrayOfClass.push(userId);

                let paramToModify = {};
                paramToModify[propertyName] = arrayOfClass;

                let updateResult = await ClassModel.findOneAndUpdate(
                    {_id: classId},
                    paramToModify,
                    {new: true}
                );

                if(updateResult){
                    tools.sendResponse(res, 200, "User added successfully", "payload", updateResult);
                } else {
                    throw new Error("Cannot update specified class.");
                }
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

/**
 * @openapi
 * '/createSubject':
 *  post:
 *     tags:
 *     - Admin routes
 *     summary: Creates a new subject.
 *     description: Adds a new subject to the database. This operation requires a valid access token, and is allowed only for the admin role.
 *     parameters:
 *       - in: query
 *         name: subjectName
 *         schema: 
 *         type: string
 *         description: the name of the subject to be created.
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Classroom was created successfully and is returned in the response.
 *      400:
 *        description: Specified subject name was not valid or the subject name already exists. 
 *      401:
 *        description: Access token is expired, or the current user is not authorized to access this route.
 *      500:
 *        description: Internal Server Error.
 */
router.post('/createSubject', verifyToken, async (req, res) => {
    
    let subjectName = req.query.subjectName;

    try{
        if(!subjectName || subjectName.length === 0){
            tools.sendResponse(res, 400, "You must provide a valid subject name."); 
        } else {
            let checkSubject = await SubjectModel.find({name : subjectName});
            if(checkSubject.length > 0){
                tools.sendResponse(res, 400, "Specified subject already exists."); 
            } else {
                let newSubject = {name : subjectName};
                let newSubjectDb = new SubjectModel(newSubject);
                let saveResult = await newSubjectDb.save();
                if(saveResult){
                    tools.sendResponse(res, 200, "Subject was added successfully.", "payload", saveResult); 
                } else {
                    throw new Error("Cannot add new subject.")
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
 * '/addSubjectToTeacher':
 *  put:
 *     tags:
 *     - Admin routes
 *     summary: Adds the subject to the given teacher.
 *     description: Adds the subject, specified by the given subject ID, to the given teacher, specified by the teacher ID. This operation requires a valid access token, and is allowed only for the admin role.
 *     parameters:
 *       - in: query
 *         name: teacherId
 *         schema: 
 *         type: string
 *         description: the ID of the teacher to which the subject is to be added.
 *       - in: query
 *         name: subjectId
 *         schema: 
 *         type: string
 *         description: the Id of the subject to be added.
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Specified subject was correctly added to the given teacher, and the updated teacher object is returned in the payload of the response.
 *      400:
 *        description: Specified teacher or subject ID was not valid.
 *      401:
 *        description: Access token is expired, or the current user is not authorized to access this route.
 *      404:
 *        description: Specified teacher or subject was not found.
 *      500:
 *        description: Internal Server Error
 */
router.put('/addSubjectToTeacher', verifyToken, async (req, res) => { 

    const subjectId = req.query.subjectId;
    const userId = req.query.teacherId;

    try{

        if(!userId || !subjectId){
            tools.sendResponse(res, 400, 'You must provide valid teacherId and subjectId.');
        } else {
            let {user, userCategory} = await tools.findUserCategory(userId);
            let subjectFromDb = await SubjectModel.findById(subjectId);
            console.log("USER:", user);
            console.log("SUBJECT", subjectFromDb);
            if(!user || !subjectFromDb){
                tools.sendResponse(res, 404, 'Specified user or subject was not found.');
            } else {
                let arrayOfSubjectsFromTeacher = user.subjectsId;
                arrayOfSubjectsFromTeacher.push(subjectId);

                let paramToModify = {};
                paramToModify["subjectsId"] = [];
                paramToModify["subjectsId"] = arrayOfSubjectsFromTeacher;

                let updateResult = await TeacherModel.findOneAndUpdate(
                    {_id: userId},
                    paramToModify,
                    {new: true}
                );

                if(updateResult){
                    tools.sendResponse(res, 200, "Subject was associated successfully", "payload", updateResult);
                } else {
                    throw new Error("Cannot update specified teacher.");
                }
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


