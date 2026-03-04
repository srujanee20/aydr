require("./configs/init");
const path = require("path");
const express = require("express");
const apiRouter = require("./routes/apiRouter");

const PORT = process.env.PORT ?? 8000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.listen(PORT, () => console.log(`Server spinned up at port ${PORT}`));