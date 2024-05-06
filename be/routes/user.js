/**
 * @fileoverview user.js
 * This route contains all routing methods related to all users to see and modify their info.
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

/** GET Methods */
/**
 * @openapi
 * '/getUser/{userId}':
 *  get:
 *     tags:
 *     - Get User Information
 *     summary: Get user information from the given user ID
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
 *        description: Fetched Successfully
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

/** PATCH Methods */
/**
 * @openapi
 * '/modifyUser/{userId}':
 *  patch:
 *     tags:
 *     - Modify User avatar or password
 *     summary: Modify user avatar or password 
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *         type: string
 *         required: true
 *         description: Alphanumeric ID of the user to modify
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            oneOf:
 *              - "$ref": '#/components/schemas/Avatar'
 *              - "$ref": '#/components/schemas/Password'
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Updated successfully
 *      500:
 *        description: Server Error
 * 
 * components:
 *   schemas:
 *     Avatar:
 *       type: object
 *       properties: 
 *         avatar: 
 *           type: string
 *           default: https://your-url.com
 *       required:
 *         - avatar
 *     Password:
 *       type: object
 *       properties: 
 *         password: 
 *           type: string
 *           default: your-new-password
 *       required:
 *         - password
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