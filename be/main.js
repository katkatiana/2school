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
const TeacherModel = require('./models/teacher')
const SubjectModel = require('./models/subject')
const GradeModel = require('./models/grade')
const swaggerDocs = require('./docgen/swagger.js')

require('dotenv').config();


/******** Internal Variables  ***************************************************/

const PORT = 3030;

const app = express();

/******** Import ROUTES Section  *******************************************************/
const teachersRoute = require('./routes/teacher');

/******** TEST Section  *******************************************************/
// const testTeacher = async () => {

//     const subject = "Math";
//     const subjectDb =  await SubjectModel.findOne({name: subject});
//     const newTeacher = new TeacherModel(
//         {
//             firstName: "Maria",
//             lastName: "Rossi",
//             email: "maria.rossi@scuola.edu.it",
//             pswHash: "12345678"
//         }
//     )
//     newTeacher.subject.push(subjectDb._id)

//     newTeacher.save()
// }

// const testFindTeacher = async () => {
//     const teacherDb =  await TeacherModel.findOne({email: "maria.rossi@scuola.edu.it"}).populate('subject').exec()
//     console.log(teacherDb);

// }

/******** Middleware Section  *******************************************************/

app.use(express.json());
//we need to define cors before all routes in order to have them working
app.use(cors());
app.disable('x-powered-by');


app.use('/', teachersRoute);


/** Connection to mongoose */
mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Db connection error'));
db.once('open', () => {
    console.log('Database successfully connected')
    //testTeacher()
    //testFindTeacher()
})

app.listen(PORT, () => console.log(`Server connected and listening on port ${PORT}`))
swaggerDocs(app, PORT);
