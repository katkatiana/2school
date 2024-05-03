const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require("path");

/** Configuration of Cloudinary in order to connect to our personal account and upload documents there. */
cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET

    }
)

const handleHomeworkUpload = async (req, res, next) => {

    const contentType = req.headers["content-type"];

    if(contentType.includes("multipart/form-data"))
    {
        const {classId} = req.params;
        let publicId;
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
            if(err){
                console.log(err);
                tools.sendResponse(res, 400, "Homework file upload failed.");
            } else {
                // url is passed as req.file.path
                req.file.publicId = publicId;
                next();
            }
        });
    } else {
        // skip if no multipart data has been sent
        next();
    }
}

const deleteContentByPublicId = async (publicId) => {
    cloudinary.api.delete_resources_by_tag(publicId, {resource_type: "raw"})
    .then(result => console.log(result));
}

module.exports = {
    handleHomeworkUpload : handleHomeworkUpload,
    deleteContentByPublicId: handleHomeworkUpload
};
