const mysql = require('mysql2');

const connection = mysql.createPool({
  connectionLimit: 100,
  host: '10.70.131.130',
  port: 3306,
  user: 'R',
  password: '5612633',
  database: 'inventario'
});


module.exports = { connection };