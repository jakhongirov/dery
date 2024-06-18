const { fetch, fetchALL } = require('../../lib/postgres')

const cashbekList = (limit, page) => {
   const QUERY = `
      SELECT
         *
      FROM
         cashbek
      ORDER BY
         id DESC
      LIMIT ${limit}
      OFFSET ${Number((page - 1) * limit)}
   `;

   return fetchALL(QUERY)
}
const foundCode = (code) => {
   const QUERY = `
      SELECT
         *
      FROM
         users
      WHERE
         user_referral_bonus = $1
         or user_personal = $1;
   `;

   return fetch(QUERY, code)
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
            cashbek_code
            type,
            cashbek_category,
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
const removekUserBalance = (user_id, amount) => {
   const QUERY = `
      UPDATE
         users
      SET
         user_cashbek = user_cashbek - $2
      WHERE
         user_id = $1
      RETURNING *;
   `;

   return fetch(QUERY, user_id, amount)
}

module.exports = {
   cashbekList,
   foundCode,
   addCashbekUserBalance,
   addCashbek,
   removekUserBalance
}