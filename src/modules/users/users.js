const model = require('./model')

module.exports = {
   GET: async (req, res) => {
      try {
         const { limit, page, phone } = req.query

         if (limit && page) {
            const usersList = await model.usersList(limit, page, phone)

            if (usersList?.length > 0) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: usersList
               })
            } else {
               return res.status(404).json({
                  status: 404,
                  message: "Not found"
               })
            }

         } else {
            return res.status(400).json({
               status: 400,
               message: "Must write limit and page"
            })
         }

      } catch (error) {
         console.log(error);
         res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   },

   GET_BY_ID: async (req, res) => {
      try {
         const { id } = req.params

         if (id) {
            const foundUserById = await model.foundUserById(id)

            if (foundUserById) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: foundUserById
               })
            } else {
               return res.status(404).json({
                  status: 404,
                  message: "Not found"
               })
            }

         } else {
            return res.status(400).json({
               status: 400,
               message: "Bad request"
            })
         }

      } catch (error) {
         console.log(error);
         res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   },

   DELETE: async (req, res) => {
      try {
         const { id } = req.body

         if (id) {
            const deleteUser = await model.deleteUser(id)

            if (deleteUser) {
               if (deleteUser?.user_referral_bonus_image_name) {
                  const deleteOldAvatar = new FS(path.resolve(__dirname, '..', '..', '..', 'public', 'images', `${deleteUser?.user_referral_bonus_image_name}`))
                  deleteOldAvatar.delete()
               }

               if (deleteUser?.user_personal_code_image_name) {
                  const deleteOldAvatar = new FS(path.resolve(__dirname, '..', '..', '..', 'public', 'images', `${deleteUser?.user_personal_code_image_name}`))
                  deleteOldAvatar.delete()
               }

               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: deleteUser
               })
            }

         } else {
            return res.status(400).json({
               status: 400,
               message: "Bad request"
            })
         }

      } catch (error) {
         console.log(error);
         res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   },

   USER_RELATIONSHIP: async (req, res) => {
      try {
         const { limit, page } = req.query

         const getRelationships = await model.getRelationships(limit, page)

         if (getRelationships?.length > 0) {
            return res.status(200).json({
               status: 200,
               message: "Success",
               data: getRelationships
            })
         } else {
            return res.status(404).json({
               status: 404,
               message: "Not found"
            })
         }

      } catch (error) {
         console.log(error);
         res.status(500).json({
            status: 500,
            message: "Interval Server Error"
         })
      }
   }

}