/**
 * Defines all of the routes that will be a part of the images endpoint
 */

const {
    getAllItems,
    getItem,
    createItem,
    updateItem,
    updatePartialItem,
    deleteItem
} = require("./handler.js");

const express = require("express");
const router = express.Router();

router.get(`/`, getAllItems);
router.get(`/:id`, getItem);
router.post(`/`, createItem);
router.put(`/:id`, updateItem);
router.patch(`/:id`, updatePartialItem);
router.delete(`/:id`, deleteItem);

module.exports = router;