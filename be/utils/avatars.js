/**
 * @fileoverview avatars.js
 * This file contains fixed avatars URLs (stored on cloudinary) used throughout the projects' files.
 * @author Mariakatia Santangelo
 * @date   15-04-2024
 */

/******** Variables Section  *******************************************************/

const DEFAULT_AVATAR_URL = "https://res.cloudinary.com/dw4mygxon/image/upload/v1713734792/2school/user_avatar/default_avatar_llwfdn.png";

const DEFAULT_CLASS_LOGOS = [
    "https://res.cloudinary.com/dw4mygxon/image/upload/v1714586878/2school/class_logo/number-1_zicoul.png",
    "https://res.cloudinary.com/dw4mygxon/image/upload/v1714586876/2school/class_logo/number-2_remhpd.png",
    "https://res.cloudinary.com/dw4mygxon/image/upload/v1714586874/2school/class_logo/number-3_nk90du.png",
    "https://res.cloudinary.com/dw4mygxon/image/upload/v1714586871/2school/class_logo/number-4_cukuev.png",
    "https://res.cloudinary.com/dw4mygxon/image/upload/v1714586870/2school/class_logo/number-5_lkx6jt.png",
]

/******** Export Section  *******************************************************/

module.exports = {
    DEFAULT_AVATAR_URL,
    DEFAULT_CLASS_LOGOS
}