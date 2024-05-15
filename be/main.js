/**
 * @fileoverview main.js
 * This document contains all routes and the direct connection to mongoose database.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */
/******** Import Section  *******************************************************/

const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors');
const swaggerDocs = require('./docgen/swagger.js');

require('dotenv').config();


/******** Internal Variables  ***************************************************/

const PORT = 3030;

const app = express();

/******** Import ROUTES Section  *******************************************************/
const loginRoute = require('./routes/login');
const signupRoute = require('./routes/signup');
const teachersRoute = require('./routes/teacher');
const userRoute = require('./routes/user');
const classRoute = require('./routes/class');
const homeworkRoute = require('./routes/homework');
const deleteItemRoute = require('./routes/deleteItem');
const disciplinaryFileRoute = require('./routes/disciplinaryFile.js');
const modifyItemRoute = require('./routes/modifyItem');
const adminRoute = require('./routes/admin');
const { sendResponse } = require('./utils/utils.js');

let isDbUp = false;

/******** Middleware Section  *******************************************************/

app.use(express.json());
// This corsOptions make header authorization visible. 
// In this way it can be taken and set as auth token in fe.
const corsOptions = {
    exposedHeaders: 'Authorization',
};
// we need to define cors before all routes in order to have them working
app.use(cors(corsOptions));
// obfuscate server information
app.disable('x-powered-by');

app.use('/', loginRoute);
app.use('/', signupRoute);
app.use('/', teachersRoute);
app.use('/', userRoute);
app.use('/', classRoute);
app.use('/', homeworkRoute);
app.use('/', deleteItemRoute);
app.use('/', disciplinaryFileRoute);
app.use('/', modifyItemRoute);
app.use('/', adminRoute);

// this route is defined to provide the frontend with a quick
// endpoint to know if the server and the database are correctly working.
app.get('/', (req, res) => {
    if(isDbUp){
        sendResponse(res, 200, "Up");
    } else {
        sendResponse(res, 500, "Down");
    }    
});

/** Connection to mongoose */
mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Db connection error'));
db.once('open', () => {
    console.log('Database successfully connected')
    isDbUp = true;
})

app.listen(PORT, () => console.log(`Server connected and listening on port ${PORT}`))
// setup swagger documentation route, by default it is available on <server_url>/docs
swaggerDocs(app, PORT);
