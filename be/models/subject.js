/**
 * @fileoverview subject.js
 * Defines the mongoose schema for a subject to be stored in the database.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SubjectSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        }
    }
)

module.exports = mongoose.model('SubjectModel', SubjectSchema, 'subject');