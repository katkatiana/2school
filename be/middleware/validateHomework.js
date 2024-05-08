/**
 * @fileoverview validateHomework.js
 * This middleware is responsible of validating the body of HTTP request containing homework data.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');
const SubjectModel = require('../models/subject');
const ClassModel = require('../models/class');
const tools = require('../utils/utils');
const info = require('../utils/info');
const upload = require('../middleware/handleHomeworkUpload');
const deletetools = require('../middleware/validateItemToDelete');

/********************************** Function section *************************************************/

/**
 * validateHomework
 * This middleware controls every param of the body object contained in the homework add request, 
 * and allows to specify what kind of characteristics they need to have in order to advance the request to 
 * the next middleware.
 * Occurred errors, if any, are sent as an array in the response.
 * @param {*} req the incoming request. Contains the user body to be validated.
 * @param {*} res the outgoing response. It is sent with error 400 in case any error occurred.
 * @param {*} next allows to advance to the next middleware, but only if no error occurred before.
 */
const validateHomework = async (req, res, next) => {
    const errors = [];
    const userObjFromToken = req.authUserObjFromToken;
    const userIdFromToken = userObjFromToken.userId;
    const userCategoryFromToken = userObjFromToken.userCategory;
    const {
        content,
        teacherId,
        subjectId,
    } = req.body
    const classId = req.query.classId;
    const teacherObj = await TeacherModel.findById(teacherId).populate('subjectsId').exec();
    const subjectObj = await SubjectModel.findById(subjectId);
    const contentType = req.headers["content-type"];
    const classObj = 
    await ClassModel.findById(classId)
                    .populate('teachersId')
                    .exec();
    
    let subjectCheck = false;
    let teacherCheck = false;
    let fileCheck = false;

    if(content.length === 0){
        errors.push("Homework cannot be empty.");
    }

    // check consistency of teacherid
    if(!teacherObj){
        errors.push("Specified teacher does not exist.");
    }

    //check consistency of subject id
    if(!subjectObj){
        errors.push("Specified subject does not exist.");
    }

    //check consistency of class id 
    if(!classObj){
        errors.push("Specified classroom does not exist.");
    }

    // check that the subject is associated to that teacher
    if(teacherObj && subjectObj){
        teacherObj.subjectsId.map(sub => {
            if(sub._id.toString() === subjectObj._id.toString()){
                subjectCheck = true;
            }    
        })
        if(!subjectCheck){
            errors.push("The specified subject is not assigned to the given teacher.");
        } 
    }

    // check that the teacher is part of the class
    if(classObj){
        const classTeachers = classObj.teachersId;
        classTeachers.map(teach => {
            if(teach._id.toString() === teacherObj._id.toString()){
                teacherCheck = true;
            }    
        })

        if(!teacherCheck){
            errors.push("The specified teacher is not assigned to the given class.");
        }
    }

    // check that the operation is being executed by the teacher whose id (from token) is teacherId
    if((teacherObj._id.toString() !== userIdFromToken.toString()) || 
       (userCategoryFromToken !== info.TEACHER_CATEGORY_ID)){
        errors.push("Teacher identity mismatch: you must be a teacher belonging to the specified class if you want to add a new homework.");
    }   

    //Check that the file has been uploaded, but only if it is present
    if(contentType.includes("multipart/form-data")){
        if(!(req.file.path) || !(req.file.publicId)){
            errors.push("There was an issue while uploading the requested files.");
        } else {
            fileCheck = true;
        }
    }
    
    if(errors.length > 0) {
        tools.sendResponse(res, 400, "Homework creation failed due to validation errors.", "errors", errors)
        console.log("[validateHomework] Failed with errors:\n", errors);
        /**
         * This deletes the image from cloudinary.
         * Needed here since the upload of the image happens before the validation
         * of the body is possible because the body is passed as multipart/form-data in this case
         * and needs a pre-processing made by multer.
         */
        if(fileCheck){
            // delete the image, but only if it has been passed and it is valid
            await deletetools.deleteContentByPublicId(req.file.publicId);
        }
    } else {
        next()
    }
}

module.exports = validateHomework;

