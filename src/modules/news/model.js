const { fetchALL, fetch } = require('../../lib/postgres')

const newsList = (limit, page) => {
   const QUERY = `
      SELECT
         *
      FROM
         news
      ORDER BY
         news_id DESC
      LIMIT ${Number(limit)}
      OFFSET ${Number((page - 1) * limit)};
   `;

   return fetchALL(QUERY)
}
const foundNews = (id) => {
   const QUERY = `
      SELECT
         *
      FROM
         news
      WHERE
         news_id = $1;
   `;

   return fetch(QUERY, id)
}
const usersList = () => {
   const QUERY = `
      SELECT
         user_chat_id,
         user_lang
      FROM
         users;
   `;

   return fetchALL(QUERY)
}
const addNews = (
   news_title_uz,
   news_title_ru,
   news_description_uz,
   news_description_ru,
   imgUrl,
   imgName
) => {
   const QUERY = `
      INSERT INTO
         news (
            news_title_uz,
            news_title_ru,
            news_description_uz,
            news_description_ru,
            news_image_url,
            news_image_name
         ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      news_title_uz,
      news_title_ru,
      news_description_uz,
      news_description_ru,
      imgUrl,
      imgName
   )
}
const deleteNews = (id) => {
   const QUERY = `
      DELETE FROM
         news
      WHERE
         news_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, id)
}

module.exports = {
   newsList,
   foundNews,
   usersList,
   addNews,
   deleteNews
}