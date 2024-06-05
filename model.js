const { fetch, fetchALL } = require('./src/lib/postgres')

const registerUser = (
   requestName,
   requestGender,
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
            $11
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      requestName,
      requestGender,
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
   user_id
) => {
   const QUERY = `
      INSERT INTO
         users_relationship (
            relationship_name,
            relationship_birthday,
            user_id
         ) VALUES (
            $1,
            $2,
            $3
         ) RETURNING *;
   `;

   return fetch(
      QUERY,
      requestName,
      requestBirthday,
      user_id
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
   addUserRelationship
}