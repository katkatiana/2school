/**
 * @fileoverview validateItemToModify.js
 * This middleware is responsible of validating the the HTTP request needed to modify homework or report.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');
const SubjectModel = require('../models/subject');
const ClassModel = require('../models/class');
const HomeworkModel = require('../models/homework');
const DisciplinaryFileModel = require('../models/disciplinaryFile');
const tools = require('../utils/utils');
const info = require('../utils/info');
const upload = require('../middleware/handleHomeworkUpload');
const deletetools = require('../middleware/validateItemToDelete');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require("path");

/** Configuration of Cloudinary in order to connect to our personal account and upload documents there. */
cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET

    }
)



/********************************** Function section *************************************************/

/**
 * validateItemToModify
 * This middleware controls every param of the body object contained in the homework/report modification request, 
 * and allows to specify what kind of characteristics they need to have in order to advance the request to 
 * the next middleware.
 * Occurred errors, if any, are sent as an array in the response.
 * @param {*} req the incoming request. Contains the user body to be validated.
 * @param {*} res the outgoing response. It is sent with error 400 in case any error occurred.
 * @param {*} next allows to advance to the next middleware, but only if no error occurred before.
 */
const validateItemToModify = async (req, res, next) => {
    const errors = [];
    const classId = req.query.classId;
    let itemType = req.query.itemType;
    let itemId = req.query.itemId;
    const userObjFromToken = req.authUserObjFromToken; // added by verifyTOken middleware
    let targetDbModel;
    let authorCheck = false;
    let itemInDb;
    let homeworkModifyParams;
    let disciplinaryFileModifyParams;
    let paramsToModify = [];
    const contentType = req.headers["content-type"];
    let fileCheck = false;
    let propertyName;
    let classObjFromDb;
    let idFromClassCheck = false;

    // check that itemtype is correct
    if(!itemType){
        errors.push("You must provide a valid itemType in order to perform a delete operation.");
    }

    if(itemType){
        itemType = itemType.toString();
        if(!(info.ITEM_TYPE_ALLOWED.includes(itemType))){
            errors.push("Unrecognized item type.");
        } else {
            if(itemType === info.ITEM_TYPE_HOMEWORK){
                targetDbModel = HomeworkModel;
                propertyName = "homeworkId";
            } else if(itemType === info.ITEM_TYPE_DISCIPLINARYFILE){
                targetDbModel = DisciplinaryFileModel;
                propertyName = "disciplinaryFileId";
            } else {
                console.log("Not possible!")
                // not possible
            }
        }
    }

    //check params to be modified based on item type
    if(itemType === info.ITEM_TYPE_HOMEWORK){
    
        // homework can be modified either for content, attachment or subject.
        if(req.body.content){
            newContent = {
                content : req.body.content
            };
            paramsToModify.push(newContent);
        }

        if(req.body.subjectId){
            newSubject = {
                subjectId : req.body.subjectId
            }
            paramsToModify.push(newSubject)
        }

        if(contentType.includes("multipart/form-data")){
            // if content type is multipart form data, a new attachment must be provided
            if(req.file.path && req.file.publicId){
                newAttachment = {
                    attachment: req.file.path // set by previous middleware
                }
                paramsToModify.push(newAttachment);
                fileCheck = true;
            } else {
                errors.push("Content Type is form-data but no file attachment has been provided.")
            }
        }

        if(paramsToModify.length === 0){
            errors.push("You must provide modification parameters to modify an existing homework.");
        }

    } else if(itemType === info.ITEM_TYPE_DISCIPLINARYFILE){

        if(contentType.includes("multipart/form-data")){
            errors.push("Provided content type is not correct.")
        }

        if(req.body.content){
            newContent = {
                content : req.body.content
            };
            paramsToModify.push(newContent);
        } 
        
        if(paramsToModify.length === 0){
            errors.push("You must provide modification parameters to modify an existing disciplinary File.");
        }
    } else {
        // not covered
    }

    if(!itemId){
        errors.push("You must provide a valid itemId in order to perform a delete operation.");
    } else {
        itemId = itemId.toString();
    }

    if(itemId && itemType){
        //check that the provided id corresponds to a valid object in db
        itemInDb = await targetDbModel.findById(itemId).populate('teacherId').exec();
        if(!itemInDb){
            errors.push("Provided item ID does not correspond to a valid object.");
        }
    }

    //check that the user that wants to modify is the teacher author of the item.
    if(itemInDb){
        const teacherItemAuthor = itemInDb.teacherId._id; // the teacher ID of the teacher that created the item, as stored in db
        const reqUserIdFromToken = userObjFromToken.userId;

        if(teacherItemAuthor.toString() === reqUserIdFromToken.toString()){
            authorCheck = true;
        }

        if(!authorCheck){
            errors.push("The specified userId is not the author of the resource, so it is not allowed to perform the requested operation");
        }
    }

    //check that the provided class exists, and that it contains the referenced item
    if((itemType === info.ITEM_TYPE_HOMEWORK) && !classId){
        errors.push("You must provide the class to which the item belongs.");
    }


    if(itemId && itemType && classId){
        classObjFromDb = await ClassModel.findById(classId).populate(propertyName).exec();
        if(!classObjFromDb) {
            errors.push("THe specified class was not found in the database.")
        }
    }

    if(classObjFromDb){
        const arrayOfItemsFromClassObj = classObjFromDb[propertyName];
        arrayOfItemsFromClassObj.map(item => {
            if(item._id.toString() === itemId){
                idFromClassCheck = true;
            }
        });

        if(!idFromClassCheck){
            errors.push("The specified item does not belong to the provided classroom object ID.")
        }
    }

    if(errors.length > 0) {
        tools.sendResponse(res, 400, "Item update failed due to validation errors.", "errors", errors)
        console.log("[validateItemToModify] Failed with errors:\n", errors);
        /**
         * This deletes the image from cloudinary.
         * Needed here since the upload of the image happens before the validation
         * of the body is possible because the body is passed as multipart/form-data in this case
         * and needs a pre-processing made by multer.
         */
        if(fileCheck){
            // delete the new image, but only if it has been passed and it is valid
            await deletetools.deleteContentByPublicId(req.file.publicId);
        }
    
    } else {
        req.targetModelForModify = targetDbModel; // so the next code knows about the model on which the delete is to be performed
        if(paramsToModify.length > 1){
            let resultObject = paramsToModify.reduce(function(result, currentObject) {
                for(var key in currentObject) {
                    if (currentObject.hasOwnProperty(key)) {
                        result[key] = currentObject[key];
                    }
                }
                return result;
            }, {});
            req.paramsToModify = resultObject;
            if(fileCheck){ // user wants to update the file attachment.
                // retrieve the existing file attachment, if present, and pass it next.
                let cloudinaryAttachmentUrl = itemInDb.attachment;
                if(cloudinaryAttachmentUrl){
                    let publicIdOfCloudinaryResource = cloudinaryAttachmentUrl.split('/').pop().split(".")[0];
                    let fileExtensionToDelete = cloudinaryAttachmentUrl.split('/').pop().split(".")[1];
                    req.publicIdOfCloudinaryResource = publicIdOfCloudinaryResource;
                    req.fileExtensionToDelete = fileExtensionToDelete;
                    console.log(publicIdOfCloudinaryResource);
                    console.log(fileExtensionToDelete);
                }
            }
        } else {
            req.paramsToModify = paramsToModify[0];
        }
        next()
    }
}

module.exports = {
    validateItemToModify : validateItemToModify,
};

