/**
 * Contains the API code for reading from and writing to assets
 */

const db = require("../../util/database.js");

const TABLE_NAME = "asset";

async function getAllItems(req, res) {
    const dataset = await db.sql(`SELECT * FROM ${TABLE_NAME} WHERE deleted = 0`);
    res.json(dataset);
}

function getItem(req, res) {

}

function createItem(req, res) {

}

function updateItem(req, res) {

}

function updatePartialItem(req, res) {

}

function deleteItem(req, res) {

}

// Creates the table if we're starting with a new Sqlite file
function createTable() {

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