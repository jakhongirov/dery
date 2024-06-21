const { fetch, fetchALL } = require('./src/lib/postgres')

const registerUser = (
   requestName,
   requestGender,
   requestDay,
   requestAge,
   requestContact,
   chatId,
   personal_code,
   referral_code,
   personal_code_url,
   personal_code_name,
   referral_code_url,
   referral_code_name,
   lang
) => {
   const QUERY = `
      INSERT INTO
         users (
            user_name,
            user_gender,
            user_birthday,
            user_age,
            user_phone,
            user_chat_id,
            user_personal,
            user_referral_bonus,
            user_personal_code_image_url,
            user_personal_code_image_name,
            user_referral_bonus_image_url,
            user_referral_bonus_image_name,
            user_lang
         ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12,
            $13
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      requestName,
      requestGender,
      requestDay,
      requestAge,
      requestContact,
      chatId,
      personal_code,
      referral_code,
      personal_code_url,
      personal_code_name,
      referral_code_url,
      referral_code_name,
      lang
   )
}

const foundUserByChatId = (chatId) => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      WHERE
         user_chat_id = $1;
   `;

   return fetch(QUERY, chatId)
}

const editUserName = (user_id, text) => {
   const QUERY = `
      UPDATE
         users
      SET
         user_name = $2
      WHERE
         user_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, user_id, text)
}

const editUserContact = (user_id, text) => {
   const QUERY = `
      UPDATE
         users
      SET
         user_phone = $2
      WHERE
         user_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, user_id, text)
}

const editUserLang = (user_id, lang) => {
   const QUERY = `
      UPDATE
         users
      SET
         user_lang = $2
      WHERE
         user_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, user_id, lang)
}
const addReview = (user_id, text) => {
   const QUERY = `
      INSERT INTO
         reviews (
            user_id,
            review
         ) VALUES (
            $1,
            $2
         ) RETURNING *;
   `;

   return fetch(QUERY, user_id, text)
}
const foundUserRelationship = (user_id) => {
   const QUERY = `
      SELECT
         *
      FROM
         users_relationship
      WHERE
         user_id = $1;
   `;

   return fetchALL(QUERY, user_id)
}
const addUserRelationship = (
   requestName,
   requestBirthday,
   requestAge,
   requestGender,
   user_id
) => {
   const QUERY = `
      INSERT INTO
         users_relationship (
            relationship_name,
            relationship_birthday,
            relationship_age,
            relationship_gender,
            user_id
         ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      requestName,
      requestBirthday,
      requestAge,
      requestGender,
      user_id
   )
}
const foundRelationship = (todayString) => {
   const QUERY = `
      SELECT
         user_lang,
         user_chat_id,
         relationship_name,
         relationship_birthday,
         user_phone
      FROM
         users_relationship a
      INNER JOIN
         users b
      ON
         a.user_id = b.user_id
      WHERE
         relationship_birthday ilike '%${todayString}%';
   `;

   return fetchALL(QUERY)
}
const categories = () => {
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
const foundCategory = (text) => {
   const QUERY = `
      SELECT
         *
      FROM
         categories
      WHERE
         category_name_uz = $1
         or category_name_ru = $1;
   `;

   return fetch(QUERY, text)
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
const addOrder = (
   user_id,
   products_id,
   totalAmount,
   deleviry
) => {
   const QUERY = `
      INSERT INTO
         orders (
            user_id,
            order_products,
            order_total_price,
            deleviry,
            order_started
         ) VALUES (
            $1,
            $2,
            $3,
            $4,
            true
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      user_id,
      products_id,
      totalAmount,
      deleviry
   )
}
const addCashbekUserBalance = (user_id, cashbek) => {
   const QUERY = `
      UPDATE
         users
      SET
         user_cashbek = $2 + user_cashbek
      WHERE
         user_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, user_id, cashbek)
}
const addCashbek = (
   user_id,
   cashbek,
   code,
   type,
   category
) => {
   const QUERY = `
      INSERT INTO
         cashbek (
            user_id,
            amount,
            cashbek_code,
            type,
            cashbek_category
         ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      user_id,
      cashbek,
      code,
      type,
      category
   )
}

module.exports = {
   registerUser,
   foundUserByChatId,
   editUserName,
   editUserContact,
   editUserLang,
   addReview,
   foundUserRelationship,
   addUserRelationship,
   foundRelationship,
   categories,
   foundCategory,
   productsListByCategoryId,
   foundProduct,
   addOrder,
   addCashbekUserBalance,
   addCashbek
}