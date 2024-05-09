/**
 * @fileoverview modifyItem.js
 * This route contains all routing methods related to modify operations.
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
const ClassModel = require('../models/class');
const tools = require('../utils/utils');
const info = require('../utils/info');
const { findByIdAndDelete } = require('../models/subject');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const updatetools = require('../middleware/validateItemToModify');
const handleHomeworkUpload = require('../middleware/handleHomeworkUpload');
const deletetools = require('../middleware/validateItemToDelete');

/******** Function Section  ****************************************************/

router.patch('/modifyItem', verifyToken, handleHomeworkUpload, updatetools.validateItemToModify, async (req, res) => {
    
    const targetModelForModify = req.targetModelForModify; // added by validateItemToModify middleware
    const itemIdToUpdate = req.query.itemId.toString();
    const paramsToModify = req.paramsToModify; // added by validateItemToModify middleware
    console.log("TO MODIFY:", paramsToModify);
    try{    

        let updateResult = await targetModelForModify.findOneAndUpdate(
            {_id: itemIdToUpdate},
            paramsToModify,
            {new:true}
        );

        if(updateResult){
            if(req.publicIdOfCloudinaryResource){
                // this means that the existing object already has another attachment that has been
                // replaced, so we have to delete the old one from cloudinary.
                
                let publicIdOfCloudinaryResource = req.publicIdOfCloudinaryResource;
                let fileExtensionToDelete = req.fileExtensionToDelete;
                console.log("MI", publicIdOfCloudinaryResource);
                console.log("MI", fileExtensionToDelete);
                if(publicIdOfCloudinaryResource && fileExtensionToDelete){
                    await deletetools.deleteContentByPublicId(publicIdOfCloudinaryResource, fileExtensionToDelete);
                }
            }
            tools.sendResponse(res, 200, "Resource was updated successfully.", "updatedItem", updateResult); 
        } else {
            console.log(updateResult);
            throw new Error ("Requested resource update operation failed, please try again.");
        }

    } catch (e) {
        console.log(e);
        if(e.message){
            tools.sendResponse(res, 500, e.message); 
        }
    }


})

module.exports = router;


