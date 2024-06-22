const { fetch, fetchALL } = require('../../lib/postgres')

const ordersList = (limit, page) => {
   const QUERY = `
      SELECT
         order_id,
         a.user_id,
         user_name,
         user_phone,
         order_total_price,
         order_started,
         order_finished,
         order_create_at
      FROM
         orders a
      INNER JOIN
         users b
      ON
         a.user_id = b.user_id
      ORDER BY
         order_id DESC
      LIMIT ${Number(limit)}
      OFFSET ${Number((page - 1) * limit)};
   `;

   return fetchALL(QUERY)
}
const foundOrder = (id) => {
   const QUERY = `
      SELECT
         *
      FROM
         orders a
      INNER JOIN
         users b
      ON
         a.user_id = b.user_id   
      WHERE
         order_id = $1;
   `;

   return fetch(QUERY, id)
}
const foundProducts = (products_id) => {
   const productsId = products_id?.map(e => `${e}`).join(', ');
   const QUERY = `
      SELECT
         *
      FROM
         products a
      INNER JOIN 
         categories b
      ON
         a.category_id = b.category_id
      WHERE
         ARRAY[product_id::int] && ARRAY[${productsId}];
   `;

   return fetchALL(QUERY)
}
const deleteOrder = (id) => {
   const QUERY = `
      DELETE FROM
         orders
      WHERE
         order_id = $1
      RETURNING *;
   `

   return fetch(QUERY, id)
}

module.exports = {
   ordersList,
   foundOrder,
   foundProducts,
   deleteOrder
}