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
const TeacherModel = require('./models/teacher');
const SubjectModel = require('./models/subject');
const GradeModel = require('./models/grade');
const ClassModel = require('./models/class');
const HomeworkModel = require('./models/homework');
const StudentModel = require('./models/student');
const DisciplinaryFileModel = require('./models/disciplinaryFile.js')
const swaggerDocs = require('./docgen/swagger.js');

require('dotenv').config();


/******** Internal Variables  ***************************************************/

const PORT = 3030;

const app = express();

/******** Import ROUTES Section  *******************************************************/
const loginRoute = require('./routes/login');
const teachersRoute = require('./routes/teacher');


/******** TEST Section  *******************************************************/
const testTeacher = async () => {

    const subject = "Math";
    const subjectDb =  await SubjectModel.findOne({name: subject});
    const newTeacher = new TeacherModel(
        {
            firstName: "Maria",
            lastName: "Rossi",
            email: "maria.rossi@scuola.edu.it",
            pswHash: "12345678"
        }
    )
    newTeacher.subject.push(subjectDb._id)

    newTeacher.save()
}

const testFindTeacher = async () => {
    const teacherDb =  await TeacherModel.findOne({email: "maria.rossi@scuola.edu.it"}).populate('subject').exec()
    console.log(teacherDb);

}

const testStudent = async () => {
    const newStudent = new StudentModel(
        {
            firstName: "Gilberto",
            lastName: "Verdi",
            email: "gilberto.verdi@scuola.edu.it",
            pswHash: "holahola"
        }
    )
    await newStudent.save()
}

const testGrade = async () => {

    const teacherFirstName = "Maria"
    const teacherDb =  await TeacherModel.findOne({firstName: teacherFirstName});
    const studentFirstName = "Filippo"
    const studentDb =  await StudentModel.findOne({firstName: studentFirstName});
    const subject = "Math"
    const subjectDb =  await SubjectModel.findOne({name: subject});

    const newGrade = new GradeModel(
        {
            value: 3,
            teacherId: teacherDb._id,
            studentId: studentDb._id,
            subjectId: subjectDb._id

        }
    )

    await newGrade.save()
    const gradeDb =  await GradeModel
                            .findOne({value: 3})
                            .populate('studentId')
                            .populate('teacherId')
                            .populate('subjectId')
                            .exec()
    console.log(gradeDb);
}

const testDisciplinaryFile = async () => {

    const teacherFirstName = "Maria"
    const teacherDb =  await TeacherModel.findOne({firstName: teacherFirstName});
    const studentFirstName = "Filippo"
    const studentDb =  await StudentModel.findOne({firstName: studentFirstName});

    const newDisciplinaryFile = new DisciplinaryFileModel(
        {
            content: "The student keeps disturbing the lesson despite calls for calm.",
            teacherId: teacherDb._id,
            studentId: studentDb._id,
        }
    )

    await newDisciplinaryFile.save()
    const disciplinaryFileDb =  await DisciplinaryFileModel
                            .findOne({content: "The student keeps disturbing the lesson despite calls for calm."})
                            .populate('studentId')
                            .populate('teacherId')
                            .exec()
    console.log(disciplinaryFileDb);
}

const testHomework = async () => {

    const teacherFirstName = "Maria"
    const teacherDb =  await TeacherModel.findOne({firstName: teacherFirstName});
    const subject = "Math"
    const subjectDb =  await SubjectModel.findOne({name: subject});

    const newHomework = new HomeworkModel(
        {
            content: "Study page 133",
            teacherId: teacherDb._id,
            subjectId: subjectDb._id,
        }
    )

    await newHomework.save()
    const homeworkDb =  await HomeworkModel
                            .findOne({content: "Study page 133"})
                            .populate('subjectId')
                            .populate({
                                path: 'teacherId',
                                populate: {
                                    path: "subjectsId",
                                    model: SubjectModel
                                }
                            })
                            .exec();
    console.log(homeworkDb);
}

const testClass = async () => {

    const teacherFirstName = "Maria"
    const teacherDb =  await TeacherModel.findOne({firstName: teacherFirstName});
    const disciplinaryFile = "The student keeps disturbing the lesson despite calls for calm."
    const disciplinaryFileDb =  await DisciplinaryFileModel.findOne({content: disciplinaryFile});
    const studentFirstName = "Filippo"
    const studentDb =  await StudentModel.findOne({firstName: studentFirstName});
    const homework = "Study page 133"
    const homeworkDb =  await HomeworkModel.findOne({content: homework});


    const newClass = new ClassModel(
        {
            section: "A",
            gradeOfClass: 1,
        }
    )
    newClass.teachersId.push(teacherDb._id)
    newClass.studentsId.push(studentDb._id)
    newClass.homeworkId.push(homeworkDb._id)
    newClass.disciplinaryFileId.push(disciplinaryFileDb._id)

    await newClass.save()
    const classDb =  await ClassModel
                            .findOne({section: "A"})
                            .populate('teachersId')
                            .populate('studentsId')
                            .populate('homeworkId')
                            .populate('disciplinaryFileId')
                            .exec();
    console.log(classDb);
}

/******** Middleware Section  *******************************************************/

app.use(express.json());
//we need to define cors before all routes in order to have them working
app.use(cors());
app.disable('x-powered-by');

app.use('/', loginRoute);
app.use('/', teachersRoute);


/** Connection to mongoose */
mongoose.connect(process.env.MONGODB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Db connection error'));
db.once('open', () => {
    console.log('Database successfully connected')
    //testStudent()
    //testFindTeacher()
    //testGrade()
    //testDisciplinaryFile()
    //testHomework()
    //testClass()
})

app.listen(PORT, () => console.log(`Server connected and listening on port ${PORT}`))
swaggerDocs(app, PORT);
