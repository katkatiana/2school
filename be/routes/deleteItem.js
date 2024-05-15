/**
 * @fileoverview deleteItem.js
 * This route contains all routing methods related to delete homework/disciplinary report operations.
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
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const deletetools = require('../middleware/validateItemToDelete');

/******** Function Section  ****************************************************/

/**
 * @openapi
 * '/deleteItem':
 *  delete:
 *     tags:
 *     - Teacher routes
 *     summary: Delete existing homework or report.
 *     description: Delete an existing homework or disciplinary report, along with all its references in the database. Homeworks can also have attachment, in that case, deleting the item also deletes the file from the configured cloud service. This operation requires a valid access token.
 *     parameters:
 *       - in: query
 *         name: itemId
 *         schema: 
 *         type: string
 *         description: the ID of the disciplinary report or homework to be deleted.
 *       - in: query
 *         name: itemType
 *         description: the type of item to be modified. Can be "homework" or "disciplinaryFile".        
 *         schema: 
 *          type: string         
 *          enum: [homework, disciplinaryFile]
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Updated successfully. The updated item is returned in the payload of the response
 *      400:
 *         description: Provided input parameters are not correct. 
 *      401:
 *        description: Access token is expired, or the current user is not authorized to access this route.
 *      500:
 *        description: Server Error
 *                 
 */

router.delete('/deleteItem', verifyToken, deletetools.validateItemToDelete, async (req, res) => {

    const targetModelForDeletion = req.targetModelForDeletion; // added by validateItemToDelete middleware
    const itemIdToDelete = req.query.itemId;
    const itemType = req.query.itemType.toString();

    try{    

        // homeworks can have attachments. Check if it exists and, if yes, delete it.
        if(itemType === info.ITEM_TYPE_HOMEWORK){
            let publicIdOfCloudinaryResource = req.publicIdOfCloudinaryResource;
            let fileExtensionToDelete = req.fileExtensionToDelete;
            if(publicIdOfCloudinaryResource && fileExtensionToDelete){
                await deletetools.deleteContentByPublicId(publicIdOfCloudinaryResource, fileExtensionToDelete);
            }            
        }
        // delete the object from db
        const deleteResult = await targetModelForDeletion.findByIdAndDelete(itemIdToDelete);
        if(deleteResult){
            let classOfHomework = await ClassModel.find(
                {
                    homeworkId: {
                        $elemMatch: { $eq: itemIdToDelete }
                    }
                }
            )

            let classOfDisciplinaryFile = await ClassModel.find(
                {
                    disciplinaryFileId: {
                        $elemMatch: { $eq: itemIdToDelete }
                    }
                }
            )

            if(classOfHomework && classOfHomework.length > 0){
                classOfHomework.map(async cl => {
                    let elemIndex = cl["homeworkId"].indexOf(itemIdToDelete);
                    console.log(elemIndex);
                    cl["homeworkId"].splice(elemIndex, 1);
                    await cl.save();
                 });
            }

            if(classOfDisciplinaryFile && classOfDisciplinaryFile.length > 0){
                classOfDisciplinaryFile.map(async cl => {
                    let elemIndex = cl["disciplinaryFileId"].indexOf(itemIdToDelete);
                    cl["disciplinaryFileId"].splice(elemIndex, 1);
                    await cl.save();
                 });
            } 

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


