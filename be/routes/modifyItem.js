/**
 * @fileoverview modifyItem.js
 * This route contains all routing methods related to modify operations for homeworks and disciplinaryFiles.
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

/**
 * @openapi
 * '/modifyItem':
 *  patch:
 *     tags:
 *     - Teacher routes
 *     summary: Modify existing homework or report.
 *     description: Modify an existing homework or disciplinary report, by providing in the body the parameters that you want to modify. Homeworks can also be modified by providing a new attachment, which is stored in the configured cloud service. In that case, in that case request must be made as multipart/form-data. In all the other cases, including disciplinary report modification, the request can be sent as application/json. This operation requires a valid access token.
 *     parameters:
 *       - in: query
 *         name: itemId
 *         schema: 
 *         type: string
 *         description: the ID of the disciplinary report or homework to be modified.
 *       - in: query
 *         name: itemType
 *         description: the type of item to be modified. Can be "homework" or "disciplinaryFile".        
 *         schema: 
 *          type: string         
 *          enum: [homework, disciplinaryFile]
 *       - in: query
 *         name: classId
 *         schema: 
 *         type: string
 *         description: the Id of the class to which the item belongs.
 *       - in: body
 *         name: body
 *         description: Body containing the parameters to be modified.
 *         schema:
 *           type: object
 *           properties:
 *             content:
 *               type: string
 *               description: New homework/disciplinary file content (can be provided if the item type is either homework or disciplinary file).
 *             subjectId:
 *               type: string
 *               description: New subject of the homework (optional, to be provided only if item type corresponds to homework)
 *             attachment: 
 *               type: string
 *               format: binary
 *               description: New homework file attachment (optional, can be provided if item type corresponds to homework). If it is present, request must be sent as multipart/form-data.
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
router.patch('/modifyItem', verifyToken, handleHomeworkUpload, updatetools.validateItemToModify, async (req, res) => {
    
    const targetModelForModify = req.targetModelForModify; // added by validateItemToModify middleware
    const itemIdToUpdate = req.query.itemId.toString();
    const paramsToModify = req.paramsToModify; // added by validateItemToModify middleware
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


