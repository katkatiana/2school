/**
 * @fileoverview homework.js
 * Defines the mongoose schema for homework to be stored in the database.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TeacherModel = require('./teacher');
const SubjectModel = require('./subject');

const HomeworkSchema = new Schema(
    {
        content: {
            type: String,
            required: true
        },
        teacherId:
            {
                type: Schema.Types.ObjectId,
                ref: TeacherModel
            },
        subjectId:
            {
                type: Schema.Types.ObjectId,
                ref: SubjectModel
            }
    }
)

module.exports = mongoose.model('HomeworkModel', HomeworkSchema, 'homework');