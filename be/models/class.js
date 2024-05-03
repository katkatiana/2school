/**
 * @fileoverview class.js
 * Defines the mongoose schema for a class to be stored in the database.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TeacherModel = require('./teacher');
const StudentModel = require('./student');
const HomeworkModel = require('./homework');
const DisciplinaryFileModel = require('./disciplinaryFile');

const ClassSchema = new Schema(
    {
        section: {
            type: String,
            required: true
        },
        gradeOfClass: {
            type: Number,
            required: true
        },
        logo: {
            type: String,
            required: true
        },
        teachersId: [
            {
                type: Schema.Types.ObjectId,
                ref: TeacherModel
            }
        ],
        studentsId: [
            {
                type: Schema.Types.ObjectId,
                ref: StudentModel
            }
        ],
        homeworkId: [
            {
                type: Schema.Types.ObjectId,
                ref: HomeworkModel
            }
        ],
        disciplinaryFileId: [
            {
                type: Schema.Types.ObjectId,
                ref: DisciplinaryFileModel
            }
        ]
    }
)

module.exports = mongoose.model('ClassModel', ClassSchema, 'class');