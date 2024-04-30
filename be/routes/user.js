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



/******** Function Section  ****************************************************/

/** GET Methods */
/**
 * @openapi
 * '/getUser':
 *  get:
 *     tags:
 *     - Get User
 *     summary: Get all the teachers in the database
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      500:
 *        description: Server Error
 */
router.get('/getUser/:id', async (req, res) => {
    const { id } = req.params;
    console.log(id)
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

router.patch('/modifyUser/:id', async (req, res) => {

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