/**
 * @fileoverview modify_delete.js
 * This route contains all routing methods related to modify/delete operations.
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
const deletetools = require('../middleware/validateItemToDelete');

/******** Function Section  ****************************************************/

router.delete('/deleteItem', verifyToken, deletetools.validateItemToDelete, async (req, res) => {

    const targetModelForDeletion = req.targetModelForDeletion; // added by validateItemToDelete middleware
    const itemIdToDelete = req.query.itemId;
    const itemType = req.query.itemType.toString();
    

    try{    

        // homeworks can have attachments. Check if it exists and, if yes, delete it.
        if(itemType === deletetools.ITEM_TYPE_HOMEWORK){
            let publicIdOfCloudinaryResource = req.publicIdOfCloudinaryResource;
            await deletetools.deleteContentByPublicId(publicIdOfCloudinaryResource);
        }

        const deleteResult = await targetModelForDeletion.findByIdAndDelete(itemIdToDelete);

        if(deleteResult){
            tools.sendResponse(res, 200, "Resource was deleted successfully."); 
        } else {
            console.log(deleteResult);
            throw new Error ("Requested resource delete operation failed, please try again.");
        }

    } catch (e) {
        console.log(e);
        if(e.message){
            tools.sendResponse(res, 500, e.message); 
        }
    }
})

module.exports = router;


