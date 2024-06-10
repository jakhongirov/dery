const { fetch, fetchALL } = require('../../lib/postgres')

const productsList = (limit, page) => {
   const QUERY = `
      SELECT
         *
      FROM
         products
      ORDER BY
         product_id DESC
      LIMIT ${Number(limit)}
      OFFSET ${Number((page - 1) * limit)};
   `;

   return fetchALL(QUERY)
}
const productsListByCategoryId = (category_id) => {
   const QUERY = `
      SELECT
         *
      FROM
         products
      WHERE
         category_id = $1
      ORDER BY
         product_id DESC;
   `;

   return fetchALL(QUERY, category_id)
}
const foundProduct = (id) => {
   const QUERY = `
      SELECT
         *
      FROM
         products
      WHERE
         product_id = $1;
   `;

   return fetch(QUERY, id)
}
const addProduct = (
   product_name_uz,
   product_name_ru,
   product_description_uz,
   product_description_ru,
   product_price,
   category_id,
   imgUrl,
   imgName
) => {
   const QUERY = `
      INSERT INTO
         products (
            product_name_uz,
            product_name_ru,
            product_description_uz,
            product_description_ru,
            product_price,
            category_id,
            product_image_url,
            product_image_name
         ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      product_name_uz,
      product_name_ru,
      product_description_uz,
      product_description_ru,
      product_price,
      category_id,
      imgUrl,
      imgName
   )
}
const editProduct = (
   id,
   product_name_uz,
   product_name_ru,
   product_description_uz,
   product_description_ru,
   product_price,
   category_id,
   imgUrl,
   imgName
) => {
   const QUERY = `
      UPDATE
         products
      SET
         product_name_uz = $2,
         product_name_ru = $3,
         product_description_uz = $4,
         product_description_ru = $5,
         product_price = $6,
         category_id = $7,
         product_image_url = $8,
         product_image_name = $9
      WHERE
         product_id = $1
      RETURNING *;
   `;

   return fetch(
      QUERY,
      id,
      product_name_uz,
      product_name_ru,
      product_description_uz,
      product_description_ru,
      product_price,
      category_id,
      imgUrl,
      imgName
   )
}
const deleteProduct = (id) => {
   const QUERY = `
      DELETE FROM
         products
      WHERE
         product_id = $1;
   `;

   return fetch(QUERY, id)
}

module.exports = {
   productsList,
   productsListByCategoryId,
   foundProduct,
   addProduct,
   editProduct,
   deleteProduct
}