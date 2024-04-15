/**
 * @fileoverview teacher.js
 * Defines the mongoose schema for a teacher to be stored in the database.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SubjectModel = require('./subject')

const TeacherSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            max: 255
        },
        lastName: {
            type: String,
            required: true,
            max: 255
        },
        email: {
            type: String,
            required: true
        },
        pswHash: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            required: false
        },
        subjectsId: [
            {
                type: Schema.Types.ObjectId,
                ref: SubjectModel
            }
        ]
    }
)

module.exports = mongoose.model('TeacherModel', TeacherSchema, 'teacher');