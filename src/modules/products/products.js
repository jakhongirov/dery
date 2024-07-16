require('dotenv').config();
const model = require('./model')
const path = require('path')
const FS = require('../../lib/fs/fs')

const resizeImage = async (inputPath, outputPath) => {
   await sharp(inputPath)
      .resize(1280, 1280, { fit: 'inside' })
      .toFile(outputPath);
};

module.exports = {
   GET: async (req, res) => {
      try {
         const { limit, page } = req.query

         if (limit && page) {
            const productsList = await model.productsList(limit, page)

            if (productsList?.length > 0) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: productsList
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

   GET_CATEGORY: async (req, res) => {
      try {
         const { category_id } = req.params

         if (category_id) {
            const productsListByCategoryId = await model.productsListByCategoryId(category_id)

            if (productsListByCategoryId?.length > 0) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: productsListByCategoryId
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

   GET_ID: async (req, res) => {
      try {
         const { id } = req.params

         if (id) {
            const foundProduct = await model.foundProduct(id)

            if (foundProduct) {
               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: foundProduct
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

   ADD_PRODUCT: async (req, res) => {
      try {
         const uploadPhoto = req.file;
         const {
            product_name_uz,
            product_name_ru,
            product_description_uz,
            product_description_ru,
            product_price,
            category_id
         } = req.body;

         if (uploadPhoto) {
            const inputPath = path.resolve(__dirname, '..', 'public', 'images', uploadPhoto.filename);
            const outputPath = path.resolve(__dirname, '..', 'public', 'images', `resized_${uploadPhoto.filename}`);
            await resizeImage(inputPath, outputPath);

            const imgUrl = `${process.env.BACKEND_URL}/resized_${uploadPhoto.filename}`;
            const imgName = `resized_${uploadPhoto.filename}`;

            const addProduct = await model.addProduct(
               product_name_uz,
               product_name_ru,
               product_description_uz,
               product_description_ru,
               product_price,
               category_id,
               imgUrl,
               imgName
            );

            if (addProduct) {
               return res.status(200).json({
                  status: 200,
                  message: 'Success',
                  data: addProduct
               });
            } else {
               return res.status(400).json({
                  status: 400,
                  message: 'Bad request'
               });
            }
         } else {
            return res.status(400).json({
               status: 400,
               message: 'No image uploaded'
            });
         }
      } catch (error) {
         console.log(error);
         res.status(500).json({
            status: 500,
            message: 'Internal Server Error'
         });
      }
   },

   EDIT_PRODUCT: async (req, res) => {
      try {
         const uploadPhoto = req.file;
         const {
            id,
            product_name_uz,
            product_name_ru,
            product_description_uz,
            product_description_ru,
            product_price,
            category_id
         } = req.body;

         const foundProduct = await model.foundProduct(id);

         if (foundProduct) {
            let imgUrl = '';
            let imgName = '';

            if (uploadPhoto) {
               if (foundProduct.product_image_name) {
                  const oldImagePath = path.resolve(__dirname, '..', 'public', 'images', foundProduct.product_image_name);
                  fs.unlinkSync(oldImagePath);
               }

               const inputPath = path.resolve(__dirname, '..', 'public', 'images', uploadPhoto.filename);
               const outputPath = path.resolve(__dirname, '..', 'public', 'images', `resized_${uploadPhoto.filename}`);
               await resizeImage(inputPath, outputPath);

               imgUrl = `${process.env.BACKEND_URL}/resized_${uploadPhoto.filename}`;
               imgName = `resized_${uploadPhoto.filename}`;
            } else {
               imgUrl = foundProduct.product_image_url;
               imgName = foundProduct.product_image_name;
            }

            const editProduct = await model.editProduct(
               id,
               product_name_uz,
               product_name_ru,
               product_description_uz,
               product_description_ru,
               product_price,
               category_id,
               imgUrl,
               imgName
            );

            if (editProduct) {
               return res.status(200).json({
                  status: 200,
                  message: 'Success',
                  data: editProduct
               });
            } else {
               return res.status(400).json({
                  status: 400,
                  message: 'Bad request'
               });
            }
         } else {
            return res.status(404).json({
               status: 404,
               message: 'Not found'
            });
         }
      } catch (error) {
         console.log(error);
         res.status(500).json({
            status: 500,
            message: 'Internal Server Error'
         });
      }
   },

   DELETE_PRODUCT: async (req, res) => {
      try {
         const { id } = req.body
         const foundProduct = await model.foundProduct(id)

         if (foundProduct) {
            const deleteProduct = await model.deleteProduct(id)

            if (deleteProduct) {
               if (deleteProduct?.product_image_name) {
                  const deleteOldAvatar = new FS(path.resolve(__dirname, '..', '..', '..', 'public', 'images', `${deleteProduct?.product_image_name}`))
                  deleteOldAvatar.delete()
               }

               return res.status(200).json({
                  status: 200,
                  message: "Success",
                  data: deleteProduct
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