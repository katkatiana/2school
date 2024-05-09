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

router.get('/getAllUsers', verifyToken, async (req, res) => {
    
    const requestedUserCategory = req.query.category;
    let targetDbModel;
    let userListFromDb;
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
            if(requestedUserCategory.toString() === info.TEACHER_CATEGORY_ID.toString()){
                userListFromDb = await targetDbModel.find({}).populate("subjectsId").exec();
            } else {
                userListFromDb = await targetDbModel.find({});
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

router.put('/createClass', verifyToken, async (req, res) => { 

    const classSection = req.query.section;
    const classGrade = req.query.grade;

    try{

        let classSectionValidity = 
            classSection && typeof(classSection) === "string" && classSection.length === 1;

        let classGradeValidity = 
            classGrade && typeof(classGrade) === "number" && classGrade.toString().length === 1 && classGrade > 0 && classGrade < 6;


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

            if(dbObj){
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
                    tools.sendResponse(res, 200, "Class successfully created", "payload", newClassDbSave);
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

router.put('/addUserToClass/:userId', verifyToken, async (req, res) => { 

    const classId = req.query.classId;
    const userId = req.query.userId;

    try{

        if(!userId || !classId){
            tools.sendResponse(res, 400, 'You must provide valid userId and classId.');
        } else {
            let {user, userCategory} = tools.findUserCategory(userId);
            let classFromDb = await ClassModel.findById(classId);
            if(!user || !classFromDb){
                tools.sendResponse(res, 400, 'Specified user or class was not found.');
            } else {
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

                let paramToModify;
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

router.post('/createSubject', verifyToken, async (req, res) => {
    
    let subjectName = req.query.subjectName;

    try{
        if(!subjectName || subjectName.length === 0){
            tools.sendResponse(res, 200, "You must provide a valid subject name."); 
        } else {
            let checkSubject = await SubjectModel.find({name : subjectName});
            if(checkSubject.length > 0){
                tools.sendResponse(res, 200, "Specified subject already exists."); 
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
                tools.sendResponse(res, 400, 'Specified user or subject was not found.');
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


