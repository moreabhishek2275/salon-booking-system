require("dotenv").config();
const mysql = require("mysql2");

const isProduction = !!process.env.DB_HOST;

const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "salonhub",

    ...(isProduction && {
        ssl: {
            rejectUnauthorized: false
        }
    })
});

connection.connect((err) => {
    if (err) {
        console.log("❌ Database Connection Failed");
        console.log(err.message);
        return;
    }

    console.log("✅ MySQL Database Connected Successfully");
});

module.exports = connection;