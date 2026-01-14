const express = require("express");
const router = express.Router();

router.use(
	"/authentication",
	require("./authentication")
);

router.use(
	"/users",
	require("./users")
);

module.exports = router;
