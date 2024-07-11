const { fetch, fetchALL } = require('../../lib/postgres')

const usersList = (limit, page, phone) => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      ${phone ? (
         `
             WHERE
               user_phone like '%${phone}%'
          `
      ) : ""}
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
const deleteUser = (id) => {
   const QUERY = `
      DELETE FROM
         users
      WHERE
         user_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, id)
}

module.exports = {
   usersList,
   foundUserById,
   deleteUser
}