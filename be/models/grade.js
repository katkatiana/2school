/**
 * @fileoverview grade.js
 * Defines the mongoose schema for a grade to be stored in the database.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TeacherModel = require('./teacher');
const StudentModel = require('./student');
const SubjectModel = require('./subject');

const GradeSchema = new Schema(
    {
        value: {
            type: Number,
            required: true,
            min: 2,
            max: 10
        },
        teacherId: {
                type: Schema.Types.ObjectId,
                ref: TeacherModel
        },
        studentId: {
                type: Schema.Types.ObjectId,
                ref: StudentModel
            },
        subjectId: {
                type: Schema.Types.ObjectId,
                ref: SubjectModel
            }
    }
)

module.exports = mongoose.model('GradeModel', GradeSchema, 'grade');