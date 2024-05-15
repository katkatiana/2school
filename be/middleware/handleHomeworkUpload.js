/**
 * @fileoverview handleHomeworkUpload.js
 * This middleware is responsible of handling the interaction with the cloudinary service whenever a new upload is needed.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */
/********************************** Import section ***************************************************/

const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require("path");
const tools = require('../utils/utils');
const info = require('../utils/info');

/********************************** Variables section *************************************************/

/** Configuration of Cloudinary in order to connect to our personal account and upload documents there. */
cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET

    }
)

/********************************** Functions section *************************************************/

/**
 * handleHomeworkUpload
 * This middleware controls the upload request to the cloudinary service whenever a new attachment must be handled.
 * A new file upload must be issued when a new homework is created with an attachment, or when
 * an existing homework is modified by providing a new attachment to it.
 * In both cases, multer + cloudinary configuration is used to parse the multipart/form-data request 
 * and to provide a standard body to the next middlewares.
 * File binary must be provided in the "attachment" property of the request.
 * The uploaded file will be inserted in a classroom-ID specific folder, with a name that contains the actual date and
 * that corresponds to the publicId of the file.
 * A tag is added to the file, which corresponds to the publicId of the file.
 * This tag is used to delete the file from cloudinary when needed.
 * @param {*} req the incoming request. Will contain the file object if the upload is successful.
 * @param {*} res the outgoing response.
 * @param {*} next allows to advance to the next middleware, but only if no error occurred before.
 */
const handleHomeworkUpload = async (req, res, next) => {

    const itemType = req.query.itemType;    
    const contentType = req.headers["content-type"];
    let conditionToCheck;

    if(!contentType){
        tools.sendResponse(res, 400, "Invalid content-type.");
    } else {
        // this middleware gets called during homework first creation and for
        // existing homework object update, so we must distinguish the two cases
        if(itemType){
            // this is the case of homework update
            conditionToCheck = 
                ((itemType === info.ITEM_TYPE_HOMEWORK) && (contentType.includes("multipart/form-data")))
        } else {
            // this is the case of homework first creation and upload
            conditionToCheck = (contentType.includes("multipart/form-data"));
        }
        if(conditionToCheck) 
        {
            const classId = req.query.classId;
            let publicId;

            if(!classId){
                tools.sendResponse(res, 400, "ClassID must be provided.");
            } else {

                const cloudStorage = new CloudinaryStorage({
                    cloudinary: cloudinary,
                    params: (req, file) => {
                    const folderPath = "class_"+classId+"_homeworks";
                    const fileExtension = path.extname(file.originalname).substring(1);
                    publicId = `${file.fieldname}-${Date.now()}`;
                    
                    return {
                        resource_type: "auto",
                        folder: folderPath,
                        public_id: publicId,
                        format: fileExtension,
                        tags: publicId
                    };
                    },
                });
        
                const cloudUpload = multer({ 
                    storage: cloudStorage,
                });
        
                let upload = await cloudUpload.single("attachment");
        
                upload(req, res, function (err) {
                    if(err || !(req.file)){
                        if(err){
                            console.log(err);
                        } else {
                            console.log("[handleHomeworkUpload] File upload failed.")
                        }
                        tools.sendResponse(res, 400, "Homework file upload failed.");
                    } else {
                        // url is passed as req.file.path
                        req.file.publicId = publicId;
                        next();
                    }
                });
            }
        } else {
            // skip if no multipart data has been sent
            next();
        }
    }
}

module.exports = handleHomeworkUpload;
