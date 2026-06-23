const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
    try {
        const header = req.headers.authorization;
        if(!header){
            return res.status(401).json({message: 'Токен отсутствует'});
        }
        const token = header.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(e) {
        res.status(401).json({message: 'Токен невалидный'})
    }
}

module.exports = authMiddleware;