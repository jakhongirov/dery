const { Pool } = require("pg");
const { connection } = require("../config");

// const credentials = {
//    user: "postgres",
//    host: "localhost",
//    database: "",
//    password: "",
//    port: 5432,
// };

const pool = new Pool({
   connectionString: connection.connectionStringEL,
   max: 50, // Adjust based on your application's needs
   idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
   connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

const fetch = async (SQL, ...params) => {
   const client = await pool.connect();
   try {
      const { rows: [row] } = await client.query(SQL, params);
      return row;
   } catch (error) {
      console.error('Database query error:', error);
      throw error;
   } finally {
      client.release();
   }
};

const fetchALL = async (SQL, ...params) => {
   const client = await pool.connect();
   try {
      const { rows } = await client.query(SQL, params);
      return rows;
   } catch (error) {
      console.error('Database query error:', error);
      throw error;
   } finally {
      client.release();
   }
};

module.exports = {
   fetch,
   fetchALL,
};