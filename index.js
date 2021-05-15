const express = require("express");
const app = express();

const PORT = 8000;

// Routes
app.get("/", (req, res) => {
    res.json({succes: true})
});

app.listen(PORT, () => {
    console.log("Inventory API started on port " + PORT);
})