/**
 * Contains the API code for reading from and writing to images
 */

const db = require("../../util/database.js");

const TABLE_NAME = "image";
const ERROR_PREFIX = "image";

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
        const item = await db.insertItem(TABLE_NAME, toSave);
        console.log("Item:", item);
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
    try {
        if (!req.body) {
            res.status(400).json({
                code: `${ERROR_PREFIX}.put.badrequest`,
                message: "Missing body"
            });
            return;
        }
        const id = req.params.id;

        const prevEntry = await db.getItem(TABLE_NAME, id);

        if (!prevEntry) {
            res.status(404).json({
                code: `${ERROR_PREFIX}.put.notfound`,
                message: "404 not found"
            });
            return;
        }

        console.log("Prev Entry:", prevEntry);

        let toSave = {};
        Object.assign(toSave, req.body);
        let now = (new Date()).toISOString();
        toSave.id = prevEntry.id;
        toSave.created_at = prevEntry.created_at;
        toSave.updated_at = now;
        toSave.deleted = 0;
        const item = await db.updateItem(TABLE_NAME, id, toSave);
        res.json(item);
    } catch (err) {
        console.error("Error updating item", err);
        res.status(500).json({
            code: `${ERROR_PREFIX}.put.err`,
            message: "Error updating item",
            error: err
        });
    }
}

async function updatePartialItem(req, res) {
    try {
        if (!req.body) {
            res.status(400).json({
                code: `${ERROR_PREFIX}.put.badrequest`,
                message: "Missing body"
            });
            return;
        }
        const id = req.params.id;

        const prevEntry = await db.getItem(TABLE_NAME, id);

        if (!prevEntry) {
            res.status(404).json({
                code: `${ERROR_PREFIX}.put.notfound`,
                message: "404 not found"
            });
            return;
        }

        console.log("Prev Entry:", prevEntry);

        let toSave = {};
        Object.assign(toSave, prevEntry, req.body);
        let now = (new Date()).toISOString();
        toSave.id = prevEntry.id;
        toSave.created_at = prevEntry.created_at;
        toSave.updated_at = now;
        toSave.deleted = 0;
        const item = await db.updateItem(TABLE_NAME, id, toSave);
        res.json(item);
    } catch (err) {
        console.error("Error updating item", err);
        res.status(500).json({
            code: `${ERROR_PREFIX}.put.err`,
            message: "Error updating item",
            error: err
        });
    }
}

async function deleteItem(req, res) {
    try {
        const id = req.params.id;

        const prevEntry = await db.getItem(TABLE_NAME, id);

        if (!prevEntry) {
            res.status(404).json({
                code: `${ERROR_PREFIX}.delete.notfound`,
                message: "404 not found"
            });
            return;
        }

        console.log("Prev Entry:", prevEntry);

        let toSave = prevEntry;
        let now = (new Date()).toISOString();
        const item = await db.deleteItem(TABLE_NAME, id);
        res.json(item);
    } catch (err) {
        console.error("Error deleting item", err);
        res.status(500).json({
            code: `${ERROR_PREFIX}.delete.err`,
            message: "Error deleting item",
            error: err
        });
    }
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