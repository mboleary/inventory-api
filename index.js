const express = require("express");
const app = express();

const {close} = require("./util/database.js");

const assetRouter = require("./api/asset/routes.js");

const PORT = process.env.PORT || 8000;

app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.json({succes: true})
});

app.use('/asset', assetRouter);

const httpServer = app.listen(PORT, () => {
    console.log("Inventory API started on port " + PORT);
})

function stopServer() {
    console.log("stopping server...");
    httpServer.close();
    close();
}

process.on("SIGTERM", stopServer);