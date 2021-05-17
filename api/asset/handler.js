/**
 * Contains the API code for reading from and writing to assets
 */

const db = require("../../util/database.js");

const TABLE_NAME = "asset";
const ERROR_PREFIX = "asset";

const IMAGE_TABLE_NAME = "image";
const TAG_TABLE_NAME = "tag";
const TAG_CONNECTOR_TABLE_NAME = "tag2asset";
const ASSET_CONNECTOR_TABLE_NAME = "asset2asset";

// Internal util
async function getImages(id) {
    const dataset = await db.sql(`SELECT * FROM ${IMAGE_TABLE_NAME} WHERE entry_id = $id AND deleted = 0`, {$id: id});
    return dataset;
}

async function getTags(id) {
    const dataset = await db.sql(`SELECT t.*, c.id AS connector_id FROM ${TAG_CONNECTOR_TABLE_NAME} c LEFT JOIN ${TAG_TABLE_NAME} t ON t.id = c.tag_id WHERE c.asset_id = $id AND t.deleted = 0 AND c.deleted = 0`, {$id: id});
    return dataset;
}

async function getRelatedAssets(id) {
    const dataset = await db.sql(`SELECT a2.*, c.relation_type, c.id AS connector_id FROM ${ASSET_CONNECTOR_TABLE_NAME} c LEFT JOIN ${TABLE_NAME} a2 on a2.id = c.asset_a_id WHERE c.asset_b_id = $id AND a2.deleted = 0 AND c.deleted = 0
    UNION
    SELECT a2.*, c.relation_type, c.id AS connector_id FROM ${ASSET_CONNECTOR_TABLE_NAME} c LEFT JOIN ${TABLE_NAME} a2 on a2.id = c.asset_b_id WHERE c.asset_a_id = $id AND a2.deleted = 0 AND c.deleted = 0`, {$id: id});
    return dataset;
}

async function saveImages(images, id) {
    // Get existing connections to compare to
    const existing = await getImages(id);

    console.log("Existing:", existing);

    const existingIDs = {};
    for (const item of existing) {
        existingIDs[item.id] = item;
    }

    console.log("IDs:", existingIDs);

    let promises = [];

    // Note: this design could enable entry-stealing
    for (const item of images) {
        // This does not need to create or delete images
        if (item.id && !existingIDs[item.id]) {
            promises.push(db.updateItem(IMAGE_TABLE_NAME, item.id, {entry_id: id}));
        } else if (item.id && existingIDs[item.id] && item.deleted === 1) {
            promises.push(db.updateItem(IMAGE_TABLE_NAME, item.id, {entry_id: null}));
        }
    }

    await Promise.all(promises);
}

async function saveTags(tags, id) {
    // Get existing connections to compare to
    const existing = await getTags(id);

    console.log("Existing:", existing);

    const existingIDs = {};
    for (const item of existing) {
        existingIDs[item.id] = item;
    }

    let now = (new Date()).toISOString();

    let promises = [];

    // Note: this design could enable entry-stealing
    for (const item of tags) {
        // This does not need to create or delete tags
        if (item.id && !existingIDs[item.id]) {
            const pl = {
                deleted: 0,
                created_at: now,
                updated_at: now,
                asset_id: id,
                tag_id: item.id
            };
            promises.push(db.insertItem(TAG_CONNECTOR_TABLE_NAME, pl));
        } else if (item.id && existingIDs[item.id] && item.deleted === 1) {
            promises.push(db.deleteItem(TAG_CONNECTOR_TABLE_NAME, existingIDs[item.id].connector_id));
        }
    }

    await Promise.all(promises);
}

async function saveRelations(tags, id) {
    // Get existing connections to compare to
    const existing = await getRelatedAssets(id);

    console.log("Existing:", existing);

    const existingIDs = {};
    for (const item of existing) {
        existingIDs[item.id] = item;
    }

    let now = (new Date()).toISOString();

    let promises = [];

    // Note: this design could enable entry-stealing
    for (const item of tags) {
        // This does not need to create or delete tags
        if (item.id && !existingIDs[item.id]) {
            const pl = {
                deleted: 0,
                created_at: now,
                updated_at: now,
                asset_a_id: id,
                asset_b_id: item.id
            };
            promises.push(db.insertItem(ASSET_CONNECTOR_TABLE_NAME, pl));
        } else if (item.id && existingIDs[item.id] && item.deleted === 1) {
            promises.push(db.deleteItem(ASSET_CONNECTOR_TABLE_NAME, existingIDs[item.id].connector_id));
        }
    }

    await Promise.all(promises);
}

// Handler functions

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
        const id = req.params.id;
        const item = await db.getItem(TABLE_NAME, id);
        if (!item) {
            res.status(404).json({
                code: `${ERROR_PREFIX}.get.notfound`,
                message: "404 not found"
            });
            return;
        }
        item.tags = await getTags(id);
        item.images = await getImages(id);
        item.relations = await getRelatedAssets(id);
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
        delete toSave.images;
        delete toSave.tags;
        delete toSave.relations;
        const resp = await db.insertItem(TABLE_NAME, toSave);
        
        await saveImages(req.body.images, resp.newID);
        await saveTags(req.body.tags, resp.newID);
        await saveRelations(req.body.relations, resp.newID);

        res.json(resp);
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

        let toSave = {};
        let images = req.body.images;
        let tags = req.body.tags;
        let rels = req.body.relations;

        Object.assign(toSave, req.body);

        delete toSave.images;
        delete toSave.tags;
        delete toSave.relations;


        let now = (new Date()).toISOString();
        toSave.id = prevEntry.id;
        toSave.created_at = prevEntry.created_at;
        toSave.updated_at = now;
        toSave.deleted = 0;
        const item = await db.updateItem(TABLE_NAME, id, toSave);

        await saveImages(images, id);
        await saveTags(tags, id);
        await saveRelations(rels, id);

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