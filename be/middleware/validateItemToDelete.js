/**
 * @fileoverview validateItemToDelete.js
 * This middleware is responsible of validating the the HTTP request needed to delete data.
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

const ITEM_TYPE_HOMEWORK = "homework";
const ITEM_TYPE_DISCIPLINARYFILE = "disciplinaryFile";

const ITEM_TYPE_ALLOWED = [ITEM_TYPE_HOMEWORK, ITEM_TYPE_DISCIPLINARYFILE];




/********************************** Function section *************************************************/

/**
 * validateItemToDelete
 * This middleware controls every param of the body object contained in the homework add request, 
 * and allows to specify what kind of characteristics they need to have in order to advance the request to 
 * the next middleware.
 * Occurred errors, if any, are sent as an array in the response.
 * @param {*} req the incoming request. Contains the user body to be validated.
 * @param {*} res the outgoing response. It is sent with error 400 in case any error occurred.
 * @param {*} next allows to advance to the next middleware, but only if no error occurred before.
 */
const validateItemToDelete = async (req, res, next) => {
    const errors = [];

    const itemType = req.query.itemType.toString();
    const itemId = req.query.itemId.toString();
    const userObjFromToken = req.authUserObjFromToken; // added by verifyTOken middleware
    let targetDbModel;
    let authorCheck = false;
    let itemInDb;


    // check that itemtype is correct
    if(!itemType){
        errors.push("You must provide a valid itemType in order to perform a delete operation.");
    }

    if(itemType){
        if(!(ITEM_TYPE_ALLOWED.includes(itemType))){
            errors.push("Unrecognized item type.");
        } else {
            if(itemType.toString() === ITEM_TYPE_HOMEWORK){
                targetDbModel = HomeworkModel;
            } else if(itemType.toString() === ITEM_TYPE_DISCIPLINARYFILE){
                targetDbModel = DisciplinaryFileModel;
            } else {
                console.log("Not possible!")
                // not possible
            }
        }
    }

    if(!itemId){
        errors.push("You must provide a valid itemId in order to perform a delete operation.");
    }

    if(itemId && itemType){
        //check that the provided id corresponds to a valid object in db
        itemInDb = await targetDbModel.findById(itemId).populate('teacherId').exec();
        if(!itemInDb){
            errors.push("Provided item ID does not correspond to a valid object.");
        }
    }

    //check that the user that wants to delete is the teacher author of the item.
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

    if(errors.length > 0) {
        tools.sendResponse(res, 400, "Item delete failed due to validation errors.", "errors", errors)
        console.log("[validateItemToDelete] Failed with errors:\n", errors);
    } else {
        req.targetModelForDeletion = targetDbModel; // so the next code knows about the model on which the delete is to be performed
        
        // homeworks can have attachments. Check if it exists and, if yes, delete it.
        if(itemType === ITEM_TYPE_HOMEWORK){
            let cloudinaryAttachmentUrl = itemInDb.attachment;
            if(cloudinaryAttachmentUrl){
                let publicIdOfCloudinaryResource = cloudinaryAttachmentUrl.split('/').pop().split(".")[0];
                req.publicIdOfCloudinaryResource = publicIdOfCloudinaryResource;
            }
        }
        
        next()
    }
}

const deleteContentByPublicId = async (publicId) => {
    cloudinary.api.delete_resources_by_tag(publicId, {resource_type: "raw"})
    .then(result => console.log(result));
}

module.exports = {
    validateItemToDelete : validateItemToDelete,
    ITEM_TYPE_HOMEWORK : ITEM_TYPE_HOMEWORK,
    ITEM_TYPE_DISCIPLINARYFILE : ITEM_TYPE_DISCIPLINARYFILE,
    deleteContentByPublicId : deleteContentByPublicId
};
