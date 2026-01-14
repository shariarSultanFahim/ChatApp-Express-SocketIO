// config the .env file
require("dotenv").config();

exports.PORT = process.env.PORT || 4001;

exports.DB = {
	dialect: "sqlite",
	storage: "./storage/database.sqlite",
};
