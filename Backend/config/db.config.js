module.exports = {
	dialect: "postgres",
	dialectOptions: {
		ssl: { require: true, rejectUnauthorized: false }
	}
};
