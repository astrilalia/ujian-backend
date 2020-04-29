const mysql = require('mysql')

const db = mysql.createConnection({
    host: 'localhost',
    user: 'astrilalia',
    password: 'Ulyssesmoore7',
    database: 'tokosusilo',
    port: 3306
})

module.exports = db;