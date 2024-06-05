const { fetch, fetchALL } = require('../../lib/postgres')

const categoriesList = () => {
   const QUERY = `
      SELECT
         *
      FROM
         categories
      ORDER BY
         category_id DESC;
   `;

   return fetchALL(QUERY)
}
const addCategory = (
   category_name_uz,
   category_name_ru
) => {
   const QUERY = `
      INSERT INTO
         categories (
            category_name_uz,
            category_name_ru
         ) VALUES (
            $1,
            $2
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      category_name_uz,
      category_name_ru
   )
}
const foundCategory = (id) => {
   const QUERY = `
      SELECT
         *
      FROM
         categories
      WHERE
         category_id = $1;
   `;

   return fetch(QUERY, id)
}
const editCategory = (
   id,
   category_name_uz,
   category_name_ru
) => {
   const QUERY = `
      UPDATE
         categories
      SET
         category_name_uz = $2,
         category_name_ru = $3
      WHERE
         category_id = $1
      RETURNING *;
   `;

   return fetch(
      QUERY,
      id,
      category_name_uz,
      category_name_ru
   )
}
const deleteCategory = (id) => {
   const QUERY = `
      DELETE FROM
         categories
      WHERE
         category_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, id)
}

module.exports = {
   categoriesList,
   addCategory,
   foundCategory,
   editCategory,
   deleteCategory
}