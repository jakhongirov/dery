const { fetch, fetchALL } = require('../../lib/postgres')

const usersList = (limit, page) => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      ORDER BY
         user_id DESC
      LIMIT ${Number(limit)}
      OFFSET ${Number((page - 1) * limit)};
   `;

   return fetchALL(QUERY)
}

const foundUserById = (id) => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      WHERE
         user_id = $1;
   `;

   return fetch(QUERY, id)
}

module.exports = {
   usersList,
   foundUserById
}