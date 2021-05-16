/**
 * Constants and definitions for the asset database
 */

const columns = {
    id: {
        db: {
            type: "INTEGER",
            primaryKey: true
        },
        api: {
            readOnly: true
        }
    }
}