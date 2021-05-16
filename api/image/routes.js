/**
 * Defines all of the routes that will be a part of the images endpoint
 */

const {
    getAllItems,
    getItem,
    createItem,
    updateItem,
    updatePartialItem,
    deleteItem,
    uploadFile
} = require("./handler.js");

const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: process.env.IMAGES_DIR });

router.get(`/`, getAllItems);
router.get(`/:id`, getItem);
router.post(`/`, createItem);
router.put(`/:id`, updateItem);
router.patch(`/:id`, updatePartialItem);
router.delete(`/:id`, deleteItem);

router.post(`/upload`, upload.single('image'), uploadFile);

module.exports = router;