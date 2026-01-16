const express = require("express");
const router = express.Router();

router.use("/authentication", require("./authentication"));

router.use("/users", require("./users"));

router.use("/chat", require("./chat"));

router.use("/upload", require("./upload"));

module.exports = router;
