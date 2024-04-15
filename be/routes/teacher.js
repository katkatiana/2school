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

/**
 * Route to get all teachers.
 * Method: GET
 * @returns status code 200 if fetching of the teachers from db is successful.
 * @returns status code 500 if any other error occurs.
 * @note route is protected through verifyToken middleware and can only be accessed with a valid authentication key.
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

/**
 * Route to create a new user (signup).
 * The teacher to be created is contained in the request body.
 * Method: POST
 * @returns status code 201 if creation of the teacher is successful and, only if so, it stores the teacher in db.
 * @returns status code 409 if the teacher already exists.
 * @returns status code 500 if any other error occurs.
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