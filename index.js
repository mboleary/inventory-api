const express = require("express");
const app = express();
const cors = require('cors');

const {close} = require("./util/database.js");

const assetRouter = require("./api/asset/routes.js");
const tagsRouter = require("./api/tag/routes.js");
const imagesRouter = require("./api/image/routes.js");

const PORT = process.env.PORT || 8000;

app.use(cors())
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.json({succes: true})
});

app.use('/asset', assetRouter);
app.use('/tag', tagsRouter);
app.use('/image', imagesRouter);

const httpServer = app.listen(PORT, () => {
    console.log("Inventory API started on port " + PORT);
})

function stopServer() {
    console.log("stopping server...");
    httpServer.close();
    close();
}

process.on("SIGTERM", stopServer);