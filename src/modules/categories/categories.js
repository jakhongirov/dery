const model = require('./model')

module.exports = {
   GET: async (req, res) => {
      try {
         const categoriesList = await model.categoriesList()

         if (categoriesList?.lenght > 0) {
            return res.status(200).json({
               status: 200,
               message: "Success",
               data: categoriesList
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
   },

   ADD_CATEGORY: async (req, res) => {
      try {
         const { category_name_uz, category_name_ru } = req.body

         if (category_name_uz && category_name_ru) {
            const addCategory = await model.addCategory(
               category_name_uz,
               category_name_ru
            )

            if (addCategory) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: addCategory
               })
            } else {
               return res.status(400).json({
                  status: 400,
                  message: "Bad request"
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

   EDIT_CATEGORY: async (req, res) => {
      try {
         const { id, category_name_uz, category_name_ru } = req.body
         const foundCategory = await model.foundCategory(id)

         if (foundCategory) {
            const editCategory = await model.editCategory(
               id,
               category_name_uz,
               category_name_ru
            )

            if (editCategory) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: editCategory
               })
            } else {
               return res.status(400).json({
                  status: 400,
                  message: "Bad request"
               })
            }

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
   },

   DELETE_CATEGORY: async (req, res) => {
      try {
         const { id } = req.body
         const foundCategory = await model.foundCategory(id)

         if (foundCategory) {
            const deleteCategory = await model.deleteCategory(id)

            if (deleteCategory) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: deleteCategory
               })
            } else {
               return res.status(400).json({
                  status: 400,
                  message: "Bad request"
               })
            }
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