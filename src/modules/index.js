const express = require("express")
const router = express.Router()

//Middlawares
const { AUTH } = require('../middleware/auth')
const FileUpload = require('../middleware/multer')

//Files
const admins = require('./admins/admins')
const users = require('./users/users')
const categories = require('./categories/categories')
const products = require('./products/products')
const news = require('./news/news')

router
   //  ADMINS
   .get('/admins/list', AUTH, admins.GET_ADMIN)
   .post('/admin/register', admins.REGISTER_ADMIN)
   .post('/admin/login', admins.LOGIN_ADMIN)
   .delete('/admin/delete', AUTH, admins.DELETE_ADMIN)

   // USERS
   .get('/users/list', users.GET)
   .get('/user/:id', users.GET_BY_ID)

   // CATEGORIES
   .get('/categories', categories.GET)
   .post('/category/add', AUTH, categories.ADD_CATEGORY)
   .put('/category/edit', AUTH, categories.EDIT_CATEGORY)
   .delete('/category/delete', AUTH, categories.DELETE_CATEGORY)

   // PRODUCTS
   .get('/products/list/admin', AUTH, products.GET)
   .get('/products/:category_id', products.GET_CATEGORY)
   .get('/products/list/:id', products.GET_ID)
   .post('/product/add', AUTH, products.ADD_PRODUCT)
   .put('/product/edit', AUTH, products.EDIT_PRODUCT)
   .delete('/product/delete', AUTH, products.DELETE_PRODUCT)

   // NEWS
   .get('/news/list', AUTH, news.GET)
   .get('/news/:id', AUTH, news.GET_ID)
   .post('/news/add', AUTH, news.ADD_NEWS)
   .delete('/news/delete', AUTH, news.DELETE)

module.exports = router