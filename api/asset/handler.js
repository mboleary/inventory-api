/**
 * Contains the API code for reading from and writing to assets
 */

const db = require("../../util/database.js");

const TABLE_NAME = "asset";
const ERROR_PREFIX = "asset";

async function getAllItems(req, res) {
    try {
        const dataset = await db.sql(`SELECT * FROM ${TABLE_NAME} WHERE deleted = 0`);
        res.json(dataset);
    } catch (err) {
        console.error("Error getting all items", err);
        res.status(500).json({
            code: `${ERROR_PREFIX}.get.err`,
            message: "Error getting all items",
            error: err
        });
    }
}

async function getItem(req, res) {
    try {

        const item = await db.getItem(TABLE_NAME, req.params.id);
        if (!item) {
            res.status(404).json({
                code: `${ERROR_PREFIX}.get.notfound`,
                message: "404 not found"
            });
            return;
        }
        res.json(item);
    } catch (err) {
        console.error("Error getting item", err);
        res.status(500).json({
            code: `${ERROR_PREFIX}.get.err`,
            message: "Error getting item",
            error: err
        });
    }
}

async function createItem(req, res) {
    try {
        if (!req.body) {
            res.status(400).json({
                code: `${ERROR_PREFIX}.post.badrequest`,
                message: "Missing body"
            });
            return;
        }
        console.log("Body:", req.body);
        let toSave = {};
        Object.assign(toSave, req.body);
        let now = (new Date()).toISOString();
        toSave.created_at = now;
        toSave.updated_at = now;
        toSave.deleted = 0;
        const item = await db.insert(TABLE_NAME, toSave);
        res.json(item);
    } catch (err) {
        console.error("Error creating item", err);
        res.status(500).json({
            code: `${ERROR_PREFIX}.post.err`,
            message: "Error creating item",
            error: err
        });
    }
}

async function updateItem(req, res) {

}

async function updatePartialItem(req, res) {

}

async function deleteItem(req, res) {

}

// Creates the table if we're starting with a new Sqlite file
async function createTable() {

}

module.exports = {
    getAllItems,
    getItem,
    createItem,
    updateItem,
    updatePartialItem,
    deleteItem,
    createTable
}