/**
 * @fileoverview verifyToken.js
 * This middleware is responsible of verifying the access token contained in the incoming HTTP request header.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/********************************** Import section ***************************************************/
const jwt = require('jsonwebtoken');
const tools = require('../utils/utils');
const info = require('../utils/info');


/********************************** Variables section *************************************************/
let permissionTable = {};
 
permissionTable[info.TEACHER_CATEGORY_ID] = {
    'signup'     : false,
    'getUser'    : true,
    'modifyUser' : true,
    'getClasses' : true,
    'getClass'   : true,
    'getSubjects': true,
    'addHomeworkToClass' : true,
    'deleteItem' : true,
    'addReport'  : true,
    'modifyItem' : true,
    'getAllUsers': false,
    'deleteUser' : false,
    'createClass' : false,
    'addUserToClass' : false,
    'getReports' : true,
    'getHomeworks' : true,
    'createSubject' : false,
    'addSubjectToTeacher' : false
};

permissionTable[info.STUDENT_CATEGORY_ID] = {
    'signup'     : false,
    'getUser'    : true,
    'modifyUser' : true,
    'getClasses' : true,
    'getClass'   : true,
    'getSubjects': true,
    'addHomeworkToClass' : false,
    'deleteItem' : false,
    'addReport'  : false,
    'modifyItem' : false,
    'getAllUsers': false,
    'deleteUser' : false,
    'createClass' : false,
    'addUserToClass' : false,
    'getReports' : true,
    'getHomeworks' : true,
    'createSubject' : false,
    'addSubjectToTeacher' : false
};

permissionTable[info.ADMIN_CATEGORY_ID] = {
    'signup'     : true,
    'getUser'    : true,
    'modifyUser' : true,
    'getClasses' : true,
    'getClass'   : true,
    'getSubjects': true,
    'addHomeworkToClass' : true,
    'deleteItem' : true,
    'addReport'  : true,
    'modifyItem' : true,
    'getAllUsers': true,
    'deleteUser' : true,
    'createClass' : true,
    'addUserToClass' : true,
    'getReports' : true,
    'getHomeworks' : true,
    'createSubject' : true,
    'addSubjectToTeacher' : true
};

/********************************** Functions section *************************************************/


/**
 * verifyToken
 * This middleware controls the incoming request and the associated authorization token.
 * By inspecting the request and the associated token, the middleware checks if the token is present, is valid, and if it
 * is expired. It also inspects the user info contained in the token and checks if the user is allowed to access to the destination route,
 * based on a role-specific permission table that defines which routes are accessible by which category of user.
 * @param {*} req the incoming request. Contains the user body to be validated.
 * @param {*} res the outgoing response. Sent as 401 - UNAUTHORIZED in case any step of the authorization procedure fails.
 * @param {*} next allows to advance to the next middleware, but only if no error occurred before.
 * If advancing, the request object will contain the decoded user token along with the user object as retrieved from the db.
 */
const verifyToken = async (req, res, next) => {

    let tokenHeader = req.headers['authorization'];
    let expiredToken = false;
    try{
        if(!tokenHeader) {
            throw new Error ('Missing token.')
        } else {
            let token = tokenHeader.split(" ")[1];
            let decodedToken = jwt.decode(token);

            if(Math.floor(new Date().getTime()/1000) >= decodedToken.exp){
                expiredToken = true;
                throw new Error ('Access token is expired. You will be redirected to login.')
            } else {
                if(decodedToken.userId) {
                    const {user, userCategory} = await tools.findUserCategory(decodedToken.userId);
                    if(user){
                        //id contained in token corresponds to an existing user id. Now check user category
                        if(decodedToken.userCategory === userCategory) {
                            //userCategory matches. Now check permissions
                            // check that the url contains ? (query params)
                            let destinationRoute;
                            if(req.originalUrl.indexOf("?") > -1){
                                // we have url as query param. split accordingly
                                destinationRoute = req.originalUrl.split("/")[1]
                                destinationRoute = destinationRoute.split("?")[0];
                            } else {
                                destinationRoute = req.originalUrl.split("/", 2)[1]
                            }                            
                            const permission = permissionTable[userCategory.toString()][destinationRoute];
                            if(permission) {
                                console.log("[verifyToken] Permission granted to route " + destinationRoute + " for user " + user._id);
                                req.authUserObjFromToken = decodedToken;
                                req.authUserObjFromDb = user;
                                next()
                            } else {
                                throw new Error ('Unauthorized.')
                            }
                        } else {
                            throw new Error ('User category is not valid.')
                        }
                    } else {
                        throw new Error ('User not found. Please login again.')
                    }
                } else {
                    throw new Error ('Unauthorized')
                }
            }
        }
    } catch(e){
        console.log(e)
        if(expiredToken){
            tools.sendResponse(res, 401, e.message, "tokenExpired", expiredToken);        
        } else {
            tools.sendResponse(res, 401, e.message);        
        }
        
    }
}

module.exports = verifyToken;