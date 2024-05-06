/**
 * @fileoverview admin.js
 * Defines the mongoose schema for an admin to be stored in the database.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema(
    {
        email: {
            type: String,
            required: true
        },
        pswHash: {
            type: String,
            required: true
        }
    }
)

module.exports = mongoose.model('AdminModel', AdminSchema, 'admin');