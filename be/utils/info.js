/**
 * @fileoverview info.js
 * This file contains informative constants used throughout the projects' files.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Variables Section  *******************************************************/

const APP_NAME = "2school"
const CONTACT_EMAIL = "info@2school.com"
const TEACHER_CATEGORY_ID = 345;
const STUDENT_CATEGORY_ID = 589;
const UNKNOWN_CATEGORY_ID = 0;
const ADMIN_CATEGORY_ID = 118;
const TOKEN_EXPIRATION_PERIOD = '1h'
const ITEM_TYPE_HOMEWORK = "homework";
const ITEM_TYPE_DISCIPLINARYFILE = "disciplinaryFile";
const ITEM_TYPE_ALLOWED = [ITEM_TYPE_HOMEWORK, ITEM_TYPE_DISCIPLINARYFILE];

/******** Export Section  *******************************************************/

module.exports = {
    APP_NAME,
    CONTACT_EMAIL,
    TEACHER_CATEGORY_ID,
    STUDENT_CATEGORY_ID,
    UNKNOWN_CATEGORY_ID,
    ADMIN_CATEGORY_ID,
    TOKEN_EXPIRATION_PERIOD,
    ITEM_TYPE_HOMEWORK,
    ITEM_TYPE_DISCIPLINARYFILE,
    ITEM_TYPE_ALLOWED
}