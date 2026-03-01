const express = require("express");

const app = express();

const PORT = 8000;

app.get("/", (req, res) => {
    res.send("Meow");
});

app.get("/hello", (req, res) => {
    let username = req.query.name;

    res.json({
        title: "Hello World",
        name: username
    });
})

app.listen(PORT, () => console.log(`Server spinned up at port ${PORT}`));