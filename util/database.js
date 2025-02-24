/**
 * Defines the database using sqlite, and provides functions to create, read, update, and delete data
 */

const sqlite = require("sqlite3").verbose();

const DB_FILE = process.env.DB_FILE || "./file/db.sqlite";

let db = new sqlite.Database(DB_FILE, (err) => {
    if (err) {
        console.error("Error loading the database");
    } else {
        console.log("DB Loaded from " + DB_FILE);
    }
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

function getItem(table, id, opts = {}) {
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
        
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error("SQL Error:", err);
                rej(err);
                return;
            }
            res(row);
        });
    })
}

function insertItem(table, data) {
    return new Promise((res, rej) => {
        let sql = "";
        let values = [];
        let colNames = [];

        const keys = Object.keys(data);
        for (const k of keys) {
            colNames.push(k);
            if (data[k] || data[k] === 0 || data[k] === "") {
                values.push(data[k]);
            } else {
                values.push(null);
            }
        }

        sql = `INSERT INTO ${table} (${colNames.join(",")}) VALUES (${colNames.map(() => "?").join(",")})`;

        console.log("SQL:", sql, values);
        
        db.run(sql, values, function(err) {
            // the function context is needed here
            if (err) {
                console.error("Error inserting data:", err);
                rej(err);
                return;
            }
            res({success:true, changes:this.changes, newID: this.lastID});
        });
    })
}

function updateItem(table, id, data, opts = {}) {
    return new Promise((res, rej) => {
        let sql = "";
        let params = {
            $id: id
        }
        // let values = [];
        let colNames = [];

        let temp = {
            pkField: "id",
            deletedField: "deleted"
        };
        
        Object.assign(temp, opts);

        const keys = Object.keys(data);
        for (const k of keys) {
            colNames.push(k);
            if (data[k] || data[k] === 0 || data[k] === "") {
                // values.push(data[k]);
                params["$" + k] = data[k];
            } else {
                // values.push(null);
                params["$" + k] = null;
            }
        }

        sql = `UPDATE ${table} SET ${colNames.map((item) => `${item} = $${item}`).join(", ")} WHERE ${temp.pkField} = $id AND ${temp.deletedField} = 0`;

        console.log("SQL:", sql, params);
        
        db.run(sql, params, function(err) {
            if (err) {
                console.error("Error updating data:", err);
                rej(err);
                return;
            }
            res({success:true, changes:this.changes, newID: this.lastID});
        });
    })
}

function deleteItem(table, id, opts = {}) {
    return new Promise((res, rej) => {
        let sql = "";
        let params = {
            $id: id
        }

        let temp = {
            pkField: "id",
            deletedField: "deleted"
        };

        sql = `UPDATE ${table} SET ${temp.deletedField} = 1 WHERE ${temp.pkField} = $id AND ${temp.deletedField} = 0`;

        console.log("SQL:", sql, params);
        
        db.run(sql, params, function(err) {
            if (err) {
                console.error("Error deleting data:", err);
                rej(err);
                return;
            }
            res({success:true, changes:this.changes, newID: this.lastID});
        });
    })
}

module.exports = {
    close,
    sql,
    getItem,
    insertItem,
    updateItem,
    deleteItem
}