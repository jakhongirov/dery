const model = require('./model')
const { calculatePercentage } = require('../../lib/functions')

module.exports = {
   GET: async (req, res) => {
      try {
         const { limit, page } = req.query

         if (limit && page) {
            const cashbekList = await model.cashbekList(limit, page)

            if (cashbekList?.length > 0) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: cashbekList
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

   GET_USER_ID: async (req, res) => {
      try {
         const { user_id, limit, page } = req.query


         if (limit && page && user_id) {
            const foundCashbek = await model.foundCashbek(user_id, limit, page)

            if (foundCashbek?.length > 0) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: foundCashbek
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

   POST: async (req, res) => {
      try {
         const { code, type, amount } = req.body
         const foundCode = await model.foundCode(code)

         if (foundCode) {
            const cashbek = calculatePercentage(amount, 10)

            if (foundCode?.user_referral_bonus == code) {
               if (type == 'income') {
                  const addCashbekUserBalance = await model.addCashbekUserBalance(foundCode?.user_id, cashbek)
                  const addCashbek = await model.addCashbek(foundCode?.user_id, cashbek, code, type, "Referral bonus")

                  if (addCashbek && addCashbekUserBalance) {
                     return res.status(200).json({
                        status: 200,
                        message: "Success"
                     })
                  }
               } else if (type == "psy") {
                  return res.status(400).json({
                     status: 400,
                     message: "Referral QR-koddan pul yechib bo'lmaydi!"
                  })
               }
            } else if (foundCode?.user_personal == code) {
               if (type == "income") {
                  const addCashbekUserBalance = await model.addCashbekUserBalance(foundCode?.user_id, cashbek)
                  const addCashbek = await model.addCashbek(foundCode?.user_id, cashbek, code, type, "Personal bonus")

                  if (addCashbek && addCashbekUserBalance) {
                     return res.status(400).json({
                        status: 400,
                        message: "Personal QR-kodga bonus berilmaydi!"
                     })
                  }
               } else if (type == 'pay') {
                  if (amount <= foundCode?.user_cashbek) {
                     const removekUserBalance = await model.removekUserBalance(foundCode?.user_id, amount)
                     const addCashbek = await model.addCashbek(foundCode?.user_id, cashbek, code, type, "Personal bonus")

                     if (addCashbek && removekUserBalance) {
                        return res.status(200).json({
                           status: 200,
                           message: "Success"
                        })
                     }
                  } else {
                     return res.status(400).json({
                        status: 400,
                        message: "Not enough"
                     })
                  }
               }
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