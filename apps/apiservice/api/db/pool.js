let mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit : 10,
  host     : process.env.DATABASE_HOST     || 'localhost',
  database : process.env.DATABASE_DATABSE  || 'ase',
  user     : process.env.DATABASE_USER     || 'root',
  password : process.env.DATABASE_PASSWORD || 'password',
});

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    }
    if (connection) connection.release();
    return;
});

module.exports = pool
