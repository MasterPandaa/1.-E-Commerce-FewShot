const mysql = require('mysql2/promise');
const { database } = require('./config');

const pool = mysql.createPool(database);

module.exports = pool;
