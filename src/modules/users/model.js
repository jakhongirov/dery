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
const getRelationships = (limit, page) => {
   const QUERY = `
      SELECT
         a.user_id,
         user_name,
         user_phone,
         relationship_name,
         relationship_birthday,
         relationship_gender,
         relationship_age
      FROM
         users_relationship a
      INNER JOIN
         users b
      ON
         a.user_id = b.user_id
      ORDER BY
         TO_DATE(SUBSTRING(relationship_birthday, 1, 5), 'DD.MM') ASC
      LIMIT ${Number(limit)}
      OFFSET ${Number((page - 1) * limit)};
   `;

   return fetchALL(QUERY)
}

module.exports = {
   usersList,
   foundUserById,
   deleteUser,
   getRelationships
}