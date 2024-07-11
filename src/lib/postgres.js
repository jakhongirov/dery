const { Pool } = require("pg");
const { connection } = require("../config");

const credentials = {
   user: "postgres",
   host: "localhost",
   database: "dery",
   password: "behad2024",
   port: 5432,
   max: 50,
   idleTimeoutMillis: 30000,
   connectionTimeoutMillis: 2000,
};

const pool = new Pool(credentials);

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