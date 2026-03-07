require("./src/configs/init");
require("./src/configs/db");
const path = require("path");
const express = require("express");
const apiRouter = require("./src/routes/apiRouter");
const mvcRouter = require("./src/routes/mvcRouter");

const PORT = process.env.PORT ?? 8000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);
app.use("/", mvcRouter);

const server = app.listen(PORT, () => console.log(`Server spinned up at port ${PORT}`));

server.addListener('close', () => console.log('Server is shutting down...'));