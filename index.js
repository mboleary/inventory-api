const express = require("express");
const app = express();

const {close} = require("./util/database.js");

const PORT = process.env.PORT || 8000;

// Routes
app.get("/", (req, res) => {
    res.json({succes: true})
});

const httpServer = app.listen(PORT, () => {
    console.log("Inventory API started on port " + PORT);
})

function stopServer() {
    console.log("stopping server...");
    httpServer.close();
    close();
}

process.on("SIGTERM", stopServer);