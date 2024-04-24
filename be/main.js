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


/******** Middleware Section  *******************************************************/

app.use(express.json());
//this corsOptions make header authorization visible. This way it can be taken and set as auth key in fe.
const corsOptions = {
    exposedHeaders: 'Authorization',
};
//we need to define cors before all routes in order to have them working
app.use(cors(corsOptions));
app.disable('x-powered-by');

app.use('/', loginRoute);
app.use('/', signupRoute);
app.use('/', teachersRoute);


/** Connection to mongoose */
mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Db connection error'));
db.once('open', () => {
    console.log('Database successfully connected')
})

app.listen(PORT, () => console.log(`Server connected and listening on port ${PORT}`))
swaggerDocs(app, PORT);
