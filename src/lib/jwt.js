const {sign, verify} = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY 

class JWT {
   constructor (data){
      this.data = data
   }
   sign() {
      return sign(this.data, SECRET_KEY)
   }
   verify() {
      return verify(this.data, SECRET_KEY)
   }
}

module.exports = JWT