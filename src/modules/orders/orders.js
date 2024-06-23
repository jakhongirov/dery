const model = require('./model')

module.exports = {
   GET: async (req, res) => {
      try {
         const { limit, page, phone } = req.query

         if (limit && page) {
            const ordersList = await model.ordersList(limit, page, phone)

            if (ordersList?.length > 0) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: ordersList
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

   GET_ID: async (req, res) => {
      try {
         const { id } = req.params

         if (id) {
            const foundOrder = await model.foundOrder(id)

            if (foundOrder) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: foundOrder
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
            const foundOrder = await model.foundOrder(id)

            if (foundOrder) {
               const deleteOrder = await model.deleteOrder(id)

               if (deleteOrder) {
                  return res.status(200).json({
                     status: 200,
                     message: "Success",
                     data: deleteOrder
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
   }
}