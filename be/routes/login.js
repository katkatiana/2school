/**
 * @fileoverview login.js
 * This route contains all routing methods that allow user login.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');
const jwt = require('jsonwebtoken');
const tools = require('../utils/utils');
const validateLoginBody = require('../middlewares/validateLoginBody');


/******** Function Section  ****************************************************/
/** POST Methods */
/**
 * @openapi
 * '/login':
 *  post:
 *     tags:
 *     - User Login
 *     summary: Performs login of the given user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                default: johndoe@scuola.edu.it
 *              password:
 *                type: string
 *                default: johnDoe20
 *     responses:
 *      200:
 *        description: Login successful
 *      401:
 *        description: Email or password does not match
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal Server Error
 */
router.post('/login', validateLoginBody, async (req, res) => {
    let user;
    const loginEmail = req.body.email;
    const loginPassword = req.body.password;

    try{
        const userTeacher = await TeacherModel.findOne(
            {
                email: loginEmail
            }
        )
        const userStudent = await StudentModel.findOne(
            {
                email: loginEmail
            }
        )

        if(userTeacher) {
            user = userTeacher;
        } else if (userStudent) {
            user = userStudent;
        } else {
            user = undefined;
        }

        if(!user){
            tools.sendResponse(res, 404, "User not found.");
        } else {
            /** bcrypt library simplifies comparison of hashed password stored in db */
            /** calculates the hash of the received password, then compares this hash with the hash stored in the db and returns if true or false*/
            const verifyPassword = await bcrypt.compare(loginPassword, user.pswHash);
            if(!verifyPassword){
                tools.sendResponse(res, 401, 'Email or password does not match.'); 
            } else {
                 /** this jwt configuration makes possible to store the specified properties of the logged in user */
                /** create a new jwt token for the logged user using the user info retrieved from db */
                /** this token can represent both a teacher or a student */
                const token = jwt.sign(
                    {
                        userId: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        avatar: user.avatar
                    }, process.env.SECRET_KEY, {
                        expiresIn: '20s'
                    }
                )
                res.header('Authorization', "Bearer " + token)
                tools.sendResponse(res, 200, "Login successful.")
            }
        }
    }catch(e) {
        console.log(e)
        tools.sendResponse(res, 500, 'Internal Server Error.');
    }

})

module.exports = router;