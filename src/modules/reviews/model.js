const { fetch, fetchALL } = require('../../lib/postgres')

const reviewsList = (limit, page) => {
   const QUERY = `
      SELECT
         *
      FROM
         users a
      INNER JOIN
         reviews b
      ON
         a.user_id = b.user_id
      ORDER BY
         review_id DESC
      LIMIT ${Number(limit)}
      OFFSET ${Number((page - 1) * limit)}
   `;

   return fetchALL(QUERY)
}

module.exports = {
   reviewsList
}