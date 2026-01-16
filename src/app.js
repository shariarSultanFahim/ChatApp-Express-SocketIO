const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

// REST API
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Permission
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = app;
