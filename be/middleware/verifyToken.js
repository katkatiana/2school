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

/********************************** Function section *************************************************/
let permissionTable = {};
 
permissionTable[info.TEACHER_CATEGORY_ID] = {
    'signup'     : false,
    'getUser'    : true,
    'modifyUser' : true
};

permissionTable[info.STUDENT_CATEGORY_ID] = {
    'signup'     : false,
    'getUser'    : true,
    'modifyUser' : true
};

permissionTable[info.ADMIN_CATEGORY_ID] = {
    'signup'     : false,
    'getUser'    : true,
    'modifyUser' : true
};

const verifyToken = async (req, res, next) => {

    let tokenHeader = req.headers['authorization'];

    try{
        if(!tokenHeader) {
            throw new Error ('Missing token.')
        } else {
            let token = tokenHeader.split(" ")[1];
            let decodedToken = jwt.decode(token);

            if(decodedToken.userId) {
                const {user, userCategory} = await tools.findUserCategory(decodedToken.userId);
                if(user){
                    //id contained in token corresponds to an existing user id. Now check user category
                    if(decodedToken.userRole === userCategory) {
                        //userCategory matches. Now check permissions
                        const destinationRoute = req.originalUrl.split("/", 2)[1]
                        const permission = permissionTable[userCategory.toString()][destinationRoute];
                        if(permission) {
                            console.log("Permission granted for route " + destinationRoute + " for user " + user._id);
                            next()
                        } else {
                            throw new Error ('Unauthorized.')
                        }
                    } else {
                        throw new Error ('User category is not valid.')
                    }
                } else {
                    throw new Error ('User not found')
                }
            } else {
                throw new Error ('Unauthorized')
            }
        }
    } catch(e){
        console.log(e)
        tools.sendResponse(res, 401, e.message);
    }
}

module.exports = verifyToken;