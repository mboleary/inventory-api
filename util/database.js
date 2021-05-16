/**
 * Defines the database using sqlite, and provides functions to create, read, update, and delete data
 */

const sqlite = require("sqlite3").verbose();

const DB_FILE = process.env.DB_FILE || "./file/db.sqlite";

let db = new sqlite.Database(DB_FILE, (err) => {
    if (err) {
        console.error("Error loading the database");
    }
    console.log("DB Loaded from " + DB_FILE);
});

function close() {
    db.close();
}

function sql(sql, params) {
    return new Promise((res, rej) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error("SQL Error:", err);
                rej(err);
                return;
            }
            res(rows);
        })
    });
}

module.exports = {
    close,
    sql
}