const Auth = require('./auth-model');

const usernameCheck = async (req, res, next) => {
    const { username } = req.body 
    const name = await Auth.getUsername(username)
    
    if (name.length !== 0) {
        res.status(401).json({message: "username taken"})
    }

    next()
}

const regBodyCheck = (req, res, next) => {
    const { username, password } = req.body
    if (!username || !password) {
        res.status(401).json({message: "username and password required"})
    } else {
        next()
    } 
}

module.exports = {
    usernameCheck,
    regBodyCheck
}