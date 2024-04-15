/**
 * @fileoverview student.js
 * Defines the mongoose schema for a student to be stored in the database.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema(
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
            required: true
        }
    }
)

module.exports = mongoose.model('StudentModel', StudentSchema, 'student');