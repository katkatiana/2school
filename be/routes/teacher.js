/**
 * @fileoverview teacher.js
 * This route contains all routing methods related to teachers.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const TeacherModel = require('../models/teacher');

/******** Function Section  ****************************************************/

/** GET Methods */
/**
 * @openapi
 * '/getTeachers':
 *  get:
 *     tags:
 *     - Insert tag here
 *     summary: Get all the teachers in the database
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router.get('/getTeachers', async (req, res) => {
    try {
        const teachers = await TeacherModel.find();
        res
            .status(200)
            .send(teachers)
    } catch (e){
        res
            .status(500)
            .send(
                {
                    statusCode: 500,
                    message: 'Internal Server Error'
                }
            )
    }
})

/** POST Methods */
    /**
     * @openapi
     * '/api/user/register':
     *  post:
     *     tags:
     *     - User Controller
     *     summary: Create a user
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - username
     *              - email
     *              - password
     *            properties:
     *              username:
     *                type: string
     *                default: johndoe 
     *              email:
     *                type: string
     *                default: johndoe@mail.com
     *              password:
     *                type: string
     *                default: johnDoe20!@
     *     responses:
     *      201:
     *        description: Created
     *      409:
     *        description: Conflict
     *      404:
     *        description: Not Found
     *      500:
     *        description: Server Error
     */
router.post('/createTeacher', async (req, res) => {
    
    /* db stores only the hash of the received password, and not the password itself */
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const teacherName = req.body.firstName + " " + req.body.lastName;
    const teacherEmail = req.body.email;
    const subjectName = req.body.subject;

    try {
        const teacher = await TeacherModel.findOne({email: teacherEmail})
        if(teacher) {
            res
                .status(409)
                .send(
                    {
                        statusCode: 409,
                        message: 'Conflict. Teacher already exists.'
                    }
                )
        } else {
            const subject = await SubjectModel.findOne({name: subjectName});
            if(!subject) {
                res
                .status(500)
                .send(
                    {
                        statusCode: 409,
                        message: 'Conflict. Teacher already exists.'
                    }
                )
            } else {
            
            const newTeacher = new TeacherModel(
                {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    email: teacherEmail,
                    pswHash: hashedPassword,
                    avatar : req.body.avatar,
                }
            )
        
            const teacherToSave = await newTeacher.save();
            res
                .status(201)
                .send(
                    {
                        statusCode: 201,
                        payload: teacherToSave
                    }
                )
            }
        }
    } catch(e) {
        console.log(e)
        res
            .status(500)
            .send (
                {
                    statusCode: 500,
                    message: 'Internal Server Error'
                }
            )

    }
})



module.exports = router;
