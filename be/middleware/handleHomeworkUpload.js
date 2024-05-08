const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require("path");
const tools = require('../utils/utils');
const info = require('../utils/info');

/** Configuration of Cloudinary in order to connect to our personal account and upload documents there. */
cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET

    }
)

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
            console.log("UPDATE");
            conditionToCheck = 
                ((itemType === info.ITEM_TYPE_HOMEWORK) && (contentType.includes("multipart/form-data")))
        } else {
            // this is the case of homework first creation and upload
            console.log("FIRST UPLOAD");
            conditionToCheck = (contentType.includes("multipart/form-data"));
        }
        console.log(conditionToCheck);
        console.log(contentType);
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
