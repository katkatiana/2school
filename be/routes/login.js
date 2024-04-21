/**
 * @fileoverview login.js
 * This route contains all routing methods related to teachers.
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


/******** Function Section  ****************************************************/
router.post('/login', async (req, res) => {

    const loginEmail = req.body.email;
    const loginPassword = req.body.password;

    try{
        const user = await UserModel.findOne(
            {
                email: loginEmail
            }
        )
        if(!user){
            res
                .status(404)
                .send(
                    {
                        statusCode: 404,
                        message: 'User not found'
                    }
                )
        } else {
            /** bcrypt library simplifies comparison of hashed password stored in db */
            /** calculates the hash of the received password, then compares this hash with the hash stored in the db */
            const verifyPassword = await bcrypt.compare(loginPassword, user.pswHash);
        }
    }catch(e) {
        console.log(e)
        res
            .status(500)
            .send(
                {
                    statusCode: 500,
                    message: e
                }
            )
    }

})

module.exports = router;