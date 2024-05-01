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
router.get('/getUser/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    
    try {
        let {user, userCategory } = await tools.findUserCategory(id);

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
router.patch('/modifyUser/:id', verifyToken, async (req, res) => {

    const { id } = req.params;

    try{
        let {user, userCategory} = await tools.findUserCategory(id)
        if(!user) {
            tools.sendResponse(res, 404, 'User not found')
        } else {
            
            if(req.body['avatar']){
                user.avatar = req.body.avatar;
            }
            
            if(req.body['password']){
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
                user.pswHash = hashedPassword;
            }

            await user.save()

            /* Since user avatar is stored in the jwt token, we need to recompute the token and send it back to the user */
            const token = jwt.sign(
                {
                    userId: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    avatar: user.avatar,
                    userRole: userCategory
                }, process.env.SECRET_KEY, {
                    expiresIn: '20s'
                }
            )
            const authHeader = {"Authorization" : token};
            tools.sendResponse(res, 200, 'Updated successfully.', "updatedUser", user, authHeader);
        }       
    } catch(e){
        console.log(e)
        tools.sendResponse(res, 500, 'Internal Server Error')
    }
})

module.exports = router;