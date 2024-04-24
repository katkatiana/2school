/**
 * @fileoverview validateLoginBody.js
 * This middleware is responsible of validating the body of HTTP request containing user data to log in.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Import Section  *******************************************************/

const tools = require('../utils/utils');

/********************************** Function section *************************************************/

/**
 * validateLoginBody
 * This middleware controls every param of the user body object contained in the login request, 
 * and allows to specify what kind of characteristics they need to have in order to advance the request to 
 * the next middleware.
 * Occurred errors, if any, are sent as an array in the response.
 * @param {*} req the incoming request. Contains the user body to be validated.
 * @param {*} res the outgoing response. It is sent with error 400 in case any error occurred.
 * @param {*} next allows to advance to the next middleware, but only if no error occurred before.
 */
const validateLoginBody = (req, res, next) => {
    const errors = [];

    const {
        email,
        password

    } = req.body

    if(!email || !password) {
        errors.push("Email or password not present.")
    } else {
        if(!(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/).test(email)) {
            errors.push('Email is not in a correct format.')
        }
        
        if(typeof password !== 'string') {
            errors.push('Password is not in a correct format.')
        }
    }
   
    
    if(errors.length > 0) {
        tools.sendResponse(res, 400, "Provided infos are not correct.", "errors", errors)
    } else {
        next()
    }
}

module.exports = validateLoginBody;

