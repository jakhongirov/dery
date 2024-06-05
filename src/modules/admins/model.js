const { fetch, fetchALL } = require("../../lib/postgres");

const CHECK_ADMIN = `
   SELECT
      *
   FROM
      admins
   WHERE
      admin_email = $1;
`;

const CHECK_ADMIN_ID = `
   SELECT
      *
   FROM
      admins
   WHERE
      admin_id = $1;
`;

const EDIT_ADMIN_EMAIL = `
   UPDATE
      admins
   SET
      admin_email = $2
   WHERE
      admin_id = $1
   RETURNING *;
`;

const EDIT_ADMIN_PASS = `
   UPDATE
      admins
   SET
      admin_email = $2,
      admin_password = $3
   WHERE
      admin_id = $1
   RETURNING *;
`;

const DELETE_ADMIN = `
   DELETE FROM
      admins
   WHERE
      admin_id = $1
   RETURNING *;
`;

const REGISTER_ADMIN = `
   INSERT INTO
      admins (
         admin_email,
         admin_password
      ) VALUES (
         $1,
         $2
      )
   RETURNING *;
`;

const adminList = (limit, page) => {
   const AMIN_LIST = `
      SELECT
         *
      FROM
         admins
      ORDER BY
         admin_id
      LIMIT ${limit}
      OFFSET ${Number((page - 1) * limit)}
   `;

   return fetchALL(AMIN_LIST)
}
const checkAdmin = (admin_email) => fetch(CHECK_ADMIN, admin_email)
const registerAdmin = (admin_email, pass_hash) => fetch(REGISTER_ADMIN, admin_email, pass_hash)
const checkAdminById = (id) => fetch(CHECK_ADMIN_ID, id)
const editAdminPass = (id, email, pass_hash) => fetch(EDIT_ADMIN_PASS, id, email, pass_hash)
const editEmail = (id, email) => fetch(EDIT_ADMIN_EMAIL, id, email)
const deleteAdmin = (id) => fetch(DELETE_ADMIN, id)

module.exports = {
   adminList,
   checkAdmin,
   registerAdmin,
   checkAdminById,
   editAdminPass,
   editEmail,
   deleteAdmin
}