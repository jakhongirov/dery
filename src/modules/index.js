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
const orders = require("./orders/orders")
const reviews = require('./reviews/reviews')
const cashbek = require('./cashbek/cashbek')

router
   //  ADMINS
   .get('/admins/list', AUTH, admins.GET_ADMIN)
   .post('/admin/register', admins.REGISTER_ADMIN)
   .post('/admin/login', admins.LOGIN_ADMIN)
   .put('/admin/edit', AUTH, admins.EDIT_ADMIN)
   .delete('/admin/delete', AUTH, admins.DELETE_ADMIN)

   // USERS
   .get('/users/list', AUTH, users.GET)
   .get('/user/:id', users.GET_BY_ID)
   .delete('/user/delete', users.DELETE)
   .get('/users/relationship', users.USER_RELATIONSHIP)

   // CATEGORIES
   .get('/categories', categories.GET)
   .post('/category/add', AUTH, categories.ADD_CATEGORY)
   .put('/category/edit', AUTH, categories.EDIT_CATEGORY)
   .delete('/category/delete', AUTH, categories.DELETE_CATEGORY)

   // PRODUCTS
   .get('/products/list/admin', AUTH, products.GET)
   .get('/products/:category_id', products.GET_CATEGORY)
   .get('/products/list/:id', products.GET_ID)
   .post('/product/add', AUTH, FileUpload.single('image'), products.ADD_PRODUCT)
   .put('/product/edit', AUTH, FileUpload.single('image'), products.EDIT_PRODUCT)
   .delete('/product/delete', AUTH, products.DELETE_PRODUCT)

   // NEWS
   .get('/news/list', AUTH, news.GET)
   .get('/news/:id', AUTH, news.GET_ID)
   .post('/news/add', FileUpload.single('image'), news.ADD_NEWS)
   .delete('/news/delete', AUTH, news.DELETE)

   // ORDERS
   .get('/orders/list', AUTH, orders.GET)
   .get('/order/:id', AUTH, orders.GET_ID)
   .delete('/order/delete', AUTH, orders.DELETE)

   // REVIEWS
   .get('/reviews/list', AUTH, reviews.GET)

   // CASHBEK
   .get('/cashbek/list', AUTH, cashbek.GET)
   .get('/cashbek/history', AUTH, cashbek.GET_USER_ID)
   .post('/cashbek', cashbek.POST)

module.exports = router