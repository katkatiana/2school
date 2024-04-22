/**
 * @fileoverview validateSignupBody.js
 * This middleware is responsible of validating the body of HTTP request containing user data to sign up.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const tools = require('../utils/utils');
const info = require('../utils/info');

/********************************** Function section *************************************************/

/**
 * validateSignupBody
 * This middleware controls every param of the user body object contained in the signup request, 
 * and allows to specify what kind of characteristics they need to have in order to advance the request to 
 * the next middleware.
 * Occurred errors, if any, are sent as an array in the response.
 * @param {*} req the incoming request. Contains the user body to be validated.
 * @param {*} res the outgoing response. It is sent with error 400 in case any error occurred.
 * @param {*} next allows to advance to the next middleware, but only if no error occurred before.
 */
const validateSignupBody = (req, res, next) => {
    const errors = [];

    const {
        firstName,
        lastName,        
        email,
        userCategory
    } = req.body

    if(!firstName || !lastName || !email || !userCategory) {
        errors.push("Required signup data is missing.")
    } else {
        if(typeof firstName !== 'string'){
            errors.push('First name must be a string')
        }
        
        if(typeof lastName !== 'string'){
            errors.push('Last name must be a string')
        }
        if(!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/).test(email)) {
            errors.push('Email is not valid.')
        }
        if(typeof userCategory !== 'number' /* || userCategory !== info.TEACHER_CATEGORY_ID || userCategory !== info.STUDENT_CATEGORY_ID  */) {
                errors.push('UserCategory is not valid.')
        }
    }    
    
    if(errors.length > 0) {
        tools.sendResponse(res, 400, "Signup body validation failed. See errors param.", "errors", errors)
    } else {
        next()
    }
}


module.exports = validateSignupBody;
