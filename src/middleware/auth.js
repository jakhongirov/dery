const JWT = require('../lib/jwt')

module.exports = {
    AUTH: (req, res, next) => {
        try {
            const { token } = req.headers;
            const userStatus = new JWT(token).verify()

            if (!token && !userStatus) {
                res.status(401).json({
                    status: 401,
                    message: 'Unauthorized'
                })
            }
            else {
                next()
            }

        } catch (err) {
            res.status(401).json({
                status: 401,
                message: 'Unauthorized'
            })
        }
    }
}