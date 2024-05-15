/**
 * @fileoverview user.js
 * This route contains all routing methods related to generic user management.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');
const tools = require('../utils/utils');
const info = require('../utils/info');
const { findOneAndUpdate } = require('../models/subject');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const usertools = require('../middleware/validateUserRoute');


/******** Function Section  ****************************************************/

/**
 * @openapi
 * '/getUser/:userId':
 *  get:
 *     tags:
 *     - Generic User routes
 *     summary: Get user information from the given user ID
 *     description: Retrieves information about the user given by the provided user ID. A given user cannot view the information of another user, but only its personal ones. This operation requires a valid access token.
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *         type: string
 *         required: true
 *         description: Alphanumeric ID of the user to get
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Fetched successfully.
 *      500:
 *        description: Server Error
 */
router.get('/getUser/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    
    try {
        let {user, userCategory } = await tools.findUserCategory(userId);

        if(userCategory === info.UNKNOWN_CATEGORY_ID) {
            throw new Error('User id not found')
        } else {
            const userInfo = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                avatar: user.avatar
            }

            tools.sendResponse(res, 200, "User found", "payload", userInfo)
        }

    } catch (e){
        console.log(e)
        tools.sendResponse(res, 500, 'Internal Server Error.');
    }
});

/**
 * @openapi
 * '/modifyUser/:userId':
 *  patch:
 *     tags:
 *     - Generic User routes
 *     summary: Modify user informations.
 *     description: Modify user information. Teacher/student users can only modify password and/or avatar, while admins can modify all the characteristics. Since the access token also stores the avatar URL, when any modification to the avatar is requested a new access token is generated and returned in the response headers.
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *         type: string
 *         required: true
 *         description: Alphanumeric ID of the user to modify
 *       - in: body
 *         name: body
 *         description: The parameters to modify.
 *         schema:
 *           type: object
 *           properties:
 *             avatar:
 *               type: string
 *               description: URL of the new avatar (optional)
 *               example: http://myavatar.jpg
 *             password:
 *               type: string
 *               description: New password (optional)
 *               example: 12345678
 *             firstName:
 *               type: string
 *               description: New first name of the user (optional, editable only by admin)
 *               example: Johnny
 *             lastName:
 *               type: string
 *               description: New last name of the user (optional, editable only by admin)
 *               example: Smith
 *             email:
 *               type: string
 *               description: New email of the user (optional, editable only by admin)
 *               example: newemail@email.com
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Updated successfully
 *      400:
 *         description: Provided input parameters are not correct.
 *      500:
 *        description: Server Error
 *                 
 */
router.patch('/modifyUser/:userId', verifyToken, usertools.validateUserToModify, async (req, res) => {

    const { userId } = req.params;
    const targetModelForModify = req.targetModelForModify; // added by validateItemToModify middleware
    const paramsToModify = req.paramsToModify; // added by validateItemToModify middleware
    const recomputeAccessToken = req.recomputeAccessToken
    const userCategoryFromDb = req.targetUserCategory
    try{
   
        let updateResult = await targetModelForModify.findOneAndUpdate(
            {_id: userId},
            paramsToModify,
            {new: true}
        );

        if(updateResult){
            console.log(updateResult);
            /* Since user info are stored in the jwt token, we need to recompute the token and send it back to the user */
            if(recomputeAccessToken){
                const token = jwt.sign(
                    {
                        userId: userId,
                        firstName: updateResult.firstName,
                        lastName: updateResult.lastName,
                        email: updateResult.email,
                        avatar: updateResult.avatar,
                        userCategory: userCategoryFromDb
                    }, process.env.SECRET_KEY, {
                        expiresIn: info.TOKEN_EXPIRATION_PERIOD
                    }
                )
                const authHeader = {"Authorization" : token};
                tools.sendResponse(res, 200, 'Updated successfully.', "updatedUser", updateResult, authHeader);    
            } else {
                tools.sendResponse(res, 200, 'Updated successfully.', "updatedUser", updateResult);    
            }
        } else {
            console.log(updateResult);
            throw new Error ("Requested user update operation failed, please try again.");
        }

    } catch(e){
        console.log(e)
        tools.sendResponse(res, 500, 'Internal Server Error')
    }
})

module.exports = router;