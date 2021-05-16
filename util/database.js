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

function getItem(table, id, opts) {
    return new Promise((res, rej) => {
        let sql = "";
        // The dollar sign is necessary otherwise errors will be thrown
        let params = {
            $id: id
        };
        
        let temp = {
            pkField: "id",
            deletedField: "deleted"
        };
        
        Object.assign(temp, opts);
        
        sql = `SELECT * FROM ${table} WHERE ${temp.pkField}=$id AND ${temp.deletedField}=0 LIMIT 1`;

        console.log(temp, sql, params);
        
        db.get(sql, params, (err, row) => {
            console.log(row, err);
            if (err) {
                console.error("SQL Error:", err);
                rej(err);
                return;
            }
            res(row);
        });
    })
}

module.exports = {
    close,
    sql,
    getItem
}