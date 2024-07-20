function errorHandler(err, req, res, next) {


    return res.status(err.statusCode || 500).send({
        message: err.message,
        error: true,
        success: false
    })

}

module.exports = errorHandler;