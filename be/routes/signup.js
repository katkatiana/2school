/**
 * @fileoverview signup.js
 * This route contains all routing methods that allow user signup.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const TeacherModel = require('../models/teacher');
const StudentModel = require('../models/student');
const tools = require('../utils/utils');
const validateSignupBody = require('../middleware/validateSignupBody');
const avatars = require('../utils/avatars');
const info = require('../utils/info');
const verifyToken = require('../middleware/verifyToken');
const crypto = require('crypto');


/******** Variables Section  *******************************************************/

const DEFAULT_PASSWORD = "changeMe"

/** Transporter object needed to send an email with nodemailer library */
let transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.PASSWORD_SENDER
    }
});

/** Mailgen instance, needed to create responsive and modern-looking HTML emails through Mailgen library */
let mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: info.APP_NAME,
        link: process.env.FRONTEND_URL
    }
});


/******** Function Section  ****************************************************/
/** POST Methods */
/**
 * @openapi
 * '/signup':
 *  post:
 *     tags:
 *     - Admin routes
 *     summary: Performs signup of the given user. 
 *     description: Performs the registration of the given user. This route is meant to be used by admins, which are the only ones that can register new users. Upon successful registration, the user will be notified with an email to the specified address with its randomly generated password which can be used to login. This operation is allowed only for the admin role.
 *     parameters:
 *       - in: body
 *         name: body
 *         description: The parameters of the user to sign up.
 *         schema:
 *           type: object
 *           required:
 *             - userCategory
 *             - password
 *             - firstName
 *             - lastName
 *             - email
 *           properties:
 *             userCategory:
 *               type: number
 *               description: 345 identifies the teacher category, 589 the student category.
 *               example: 345
 *             firstName:
 *               type: string
 *               description: Name of the user
 *               example: John
 *             lastName:
 *               type: string
 *               description: Last Name of the user
 *               example: Doe
 *             email:
 *               type: string
 *               description: email of the user to be registered.
 *               example: johndoe@email.com
 *     security:
 *      - bearerAuth: []
 *     responses:
 *      201:
 *        description: User successfully created
 *      400:
 *        description: Email and/or password are missing and/or are not in the correct format.
 *      401:
 *        description: Access token is expired, or the current user is not authorized to access this route.
 *      409:
 *        description: User already exists
 *      500:
 *        description: Internal Server Error
 */
router.post('/signup', verifyToken, validateSignupBody, async (req, res) => {

    /* db stores only the hash of the received password, and not the password itself */
    const saltRounds = 10;
    const randomString = crypto.randomBytes(64).toString('hex');
    const defaultPassword_salted = DEFAULT_PASSWORD+randomString;
    const hashedPassword = await bcrypt.hash(defaultPassword_salted, saltRounds);
    const userCategory = req.body.userCategory;
    const userFullName = req.body.firstName + " " + req.body.lastName;
    const userEmail = req.body.email;
    const email = {
        body: {
            name: userFullName,
            intro: [
                'Welcome to '+info.APP_NAME+'! We\'re very excited to have you on board.',
                'Since you\'ve signed up, we\'ve generated a temporary password for you!',
                'You\'ll find it below.',
                defaultPassword_salted,
                'After your first login, you will need to change it in your profile settings.'
            ],
            outro: 'Need help, or have questions? Just send an email to ' + info.CONTACT_EMAIL + ', we\'d love to help.'
        }
    };

    let mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: userEmail,
        subject: 'Welcome to ' + info.APP_NAME,
        html: mailGenerator.generate(email),
        text: mailGenerator.generatePlaintext(email)
    };
    const newUser = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: userEmail,
        pswHash: hashedPassword,
        avatar: avatars.DEFAULT_AVATAR_URL
    }

    try{
        const userTeacher = await TeacherModel.findOne(
            {
                email: userEmail
            }
        )
        const userStudent = await StudentModel.findOne(
            {
                email: userEmail
            }
        )
        if(userTeacher || userStudent) {
            tools.sendResponse(res, 409, "User already exists.")
        } else {
            let newUserDb;
            if(userCategory === info.TEACHER_CATEGORY_ID) {
                newUserDb = new TeacherModel(newUser);
            } else if (userCategory === info.STUDENT_CATEGORY_ID) {
                newUserDb = new StudentModel(newUser);
            } else {
                throw new Error("Unexpected userCategory.") // not possible since validation of req body is done beforehand.
            }
            const savedUserDb = await newUserDb.save();

            tools.sendResponse(res, 201, "User successfully created", "payload", savedUserDb);
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    throw new Error(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    } catch(e) {
        console.log(e)
        tools.sendResponse(res, 500, "Internal Server Error.")
    }
})

module.exports = router;