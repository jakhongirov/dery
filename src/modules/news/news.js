require('dotenv').config();
const model = require('./model')
const path = require('path')
const FS = require('../../lib/fs/fs')
const fs = require('fs')
const { bot } = require('../../lib/bot')

module.exports = {
   GET: async (req, res) => {
      try {
         const { limit, page } = req.query

         if (limit && page) {
            const newsList = await model.newsList(limit, page)

            if (newsList?.length > 0) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: newsList
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
            const foundNews = await model.foundNews(id)

            if (foundNews) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: foundNews
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

   ADD_NEWS: async (req, res) => {
      try {
         const uploadPhoto = req.file;
         const {
            news_title_uz,
            news_title_ru,
            news_description_uz,
            news_description_ru
         } = req.body
         const imgUrl = `${process.env.BACKEND_URL}/${uploadPhoto?.filename}`;
         const imgName = uploadPhoto?.filename;
         const usersList = await model.usersList()

         const addNews = await model.addNews(
            news_title_uz,
            news_title_ru,
            news_description_uz,
            news_description_ru,
            imgUrl,
            imgName
         )

         if (addNews) {
            console.log(imgName)
            usersList?.forEach(e => {
               const imagePath = path.resolve(__dirname, '..', '..', '..', 'public', 'images', imgName);
               if (e?.user_lang == 'uz') {
                  bot.sendPhoto(e?.user_chat_id, fs.readFileSync(imagePath), {
                     parse_mode: "HTML",
                     caption: `<strong>${news_title_uz}</strong>\n\n${news_description_uz}`
                  });
               } else if (e?.user_lang == 'ru') {
                  bot.sendPhoto(e?.user_chat_id, fs.readFileSync(imagePath), {
                     parse_mode: "HTML",
                     caption: `<strong>${news_title_ru}</strong>\n\n${news_description_ru}`
                  });
               }
            });

            return res.status(200).json({
               status: 200,
               message: "Success",
               data: addNews
            })
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
         const foundNews = await model.foundNews(id)

         if (foundNews) {
            const deleteNews = await model.deleteNews(id)

            if (deleteNews) {
               if (deleteNews?.news_image_name) {
                  const deleteOldAvatar = new FS(path.resolve(__dirname, '..', '..', '..', 'public', 'images', `${deleteNews?.news_image_name}`))
                  deleteOldAvatar.delete()
               }

               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: deleteNews
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