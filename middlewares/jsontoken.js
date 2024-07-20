const jwt = require('jsonwebtoken');

const secretKey = "hhjssjjejertkjtnjentjetnjtnejt";
function createJWTToken(email, id) {

    const token = jwt.sign({
        email: email,
        id: id
    }, secretKey, { expiresIn: '24h' });

    return token;
}



function verifyJWTToken(req, res, next) {

    try {
        const token = req.headers.authorization?.split(' ')[1]; // Get the token from the Authorization header
        if (!token) {
            return res.status(401).json({ error: 'Access denied, token missing!', success: false });
        }
        let jwtRes = jwt.verify(token, secretKey);
        console.log('jwtRes', jwtRes);
        next();
    }
    catch (err) {
        next(err);
        console.log('err', err);

    }

}


module.exports = { createJWTToken, verifyJWTToken };

